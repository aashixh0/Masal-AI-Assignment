import uuid
from datetime import datetime
from typing import List, Optional, Dict
from threading import Lock

from app.schemas.lead import LeadCreate, LeadResponse, AIAnalysisResult, CalendarState, CopilotChatMessage
from app.services.ai_service import ai_service
from app.services.scoring_service import scoring_service

class LeadService:
    def __init__(self):
        self._leads: Dict[str, LeadResponse] = {}
        self._copilot_histories: Dict[str, List[CopilotChatMessage]] = {}
        self._lock = Lock()
        self._seed_sample_leads()

    def _seed_sample_leads(self):
        """Seeds initial sample leads representing HOT, WARM, and COLD tiers."""
        sample_1 = LeadCreate(
            name="Rahul Sharma",
            location="Mumbai, Andheri East / Powai",
            property_requirement="3 BHK ready-to-move apartment near metro station",
            budget="₹1.8 Cr",
            buying_timeline="Within 30 days",
            customer_message="Looking for a 3 BHK in Andheri East or Powai under 1.8 Cr. Need ready-to-move because my rent lease ends next month. Please share properties near metro line."
        )
        sample_2 = LeadCreate(
            name="Priya Patel",
            location="Bengaluru, Whitefield",
            property_requirement="2 BHK under-construction apartment with clubhouse",
            budget="₹95 Lakhs",
            buying_timeline="2 to 3 months",
            customer_message="Hi, I am looking for a 2 BHK apartment in Whitefield around 90-95 L. Flexible with possession date up to 1 year if developer is reputable. Would like amenities like gym and pool."
        )
        sample_3 = LeadCreate(
            name="Amit Verma",
            location="Delhi NCR, Gurgaon Sector 57",
            property_requirement="Plots or commercial office space",
            budget="Flexible",
            buying_timeline="6+ months",
            customer_message="Just exploring options for investment in Gurgaon commercial or residential plots for long term capital appreciation. Send generic brochure if available."
        )

        for lead in [sample_1, sample_2, sample_3]:
            self.create_lead(lead)

    def create_lead(self, lead_input: LeadCreate) -> LeadResponse:
        with self._lock:
            lead_id = str(uuid.uuid4())[:8]
            
            # 1. Run AI analysis
            analysis: AIAnalysisResult = ai_service.analyze_lead(lead_input)
            
            # 2. Calculate deterministic score and label
            score, label, reasons = scoring_service.calculate_priority(analysis)
            
            # 3. Build response model
            new_lead = LeadResponse(
                id=lead_id,
                name=lead_input.name,
                location=lead_input.location,
                property_requirement=lead_input.property_requirement,
                budget=lead_input.budget,
                buying_timeline=lead_input.buying_timeline,
                customer_message=lead_input.customer_message,
                priority_score=score,
                priority_label=label,
                priority_reasons=reasons,
                ai_analysis=analysis,
                calendar=CalendarState(scheduled=False),
                created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            )
            
            self._leads[lead_id] = new_lead
            self._copilot_histories[lead_id] = []
            return new_lead

    def get_all_leads(self) -> List[LeadResponse]:
        with self._lock:
            # Sort by priority score descending by default
            return sorted(list(self._leads.values()), key=lambda x: x.priority_score, reverse=True)

    def get_lead_by_id(self, lead_id: str) -> Optional[LeadResponse]:
        with self._lock:
            return self._leads.get(lead_id)

    def update_calendar_state(self, lead_id: str, event_id: str, event_url: str) -> Optional[LeadResponse]:
        with self._lock:
            lead = self._leads.get(lead_id)
            if not lead:
                return None
            lead.calendar = CalendarState(
                scheduled=True,
                event_id=event_id,
                event_url=event_url,
                scheduled_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
            )
            self._leads[lead_id] = lead
            return lead

    def copilot_ask(self, lead_id: str, question: str, history: List[CopilotChatMessage]) -> Optional[str]:
        lead = self.get_lead_by_id(lead_id)
        if not lead:
            return None
        
        answer = ai_service.copilot_chat(lead.model_dump(), question, history)
        
        with self._lock:
            if lead_id not in self._copilot_histories:
                self._copilot_histories[lead_id] = []
            self._copilot_histories[lead_id].append(CopilotChatMessage(sender="user", text=question))
            self._copilot_histories[lead_id].append(CopilotChatMessage(sender="assistant", text=answer))

        return answer

lead_service = LeadService()

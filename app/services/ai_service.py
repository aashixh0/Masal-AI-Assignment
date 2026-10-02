import json
import logging
import re
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.lead import AIAnalysisResult, LeadCreate, CopilotChatMessage
from app.prompts.lead_prompts import LEAD_ANALYSIS_SYSTEM_PROMPT, COPILOT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client = None
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}")

    def analyze_lead(self, lead_data: LeadCreate) -> AIAnalysisResult:
        """
        Analyzes a lead using Google Gemini API with structured output validation.
        Falls back gracefully to intelligent local analysis if API key is missing or API call fails.
        """
        user_prompt = f"""
Analyze the following Real Estate Inbound Lead:

Customer Name: {lead_data.name}
Preferred Location: {lead_data.location}
Property Requirement: {lead_data.property_requirement}
Stated Budget: {lead_data.budget}
Buying Timeline: {lead_data.buying_timeline}
Customer Inquiry / Transcript:
"{lead_data.customer_message}"
"""
        
        if self.client:
            try:
                from google.genai import types
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=LEAD_ANALYSIS_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                
                raw_text = response.text or ""
                cleaned_json = self._clean_json_string(raw_text)
                data = json.loads(cleaned_json)
                return AIAnalysisResult(**data)

            except Exception as e:
                logger.error(f"Gemini API call failed during lead analysis: {e}. Falling back to rule-based fallback.")
                return self._fallback_analysis(lead_data)
        else:
            logger.info("No GEMINI_API_KEY configured. Using intelligent fallback analysis engine.")
            return self._fallback_analysis(lead_data)

    def copilot_chat(self, lead_info: Dict[str, Any], question: str, history: List[CopilotChatMessage]) -> str:
        """
        Generates a grounded response for salesperson questions about a specific lead.
        """
        context_str = f"""
LEAD DETAILS:
- Name: {lead_info.get('name')}
- Location: {lead_info.get('location')}
- Requirement: {lead_info.get('property_requirement')}
- Budget: {lead_info.get('budget')}
- Timeline: {lead_info.get('buying_timeline')}
- Priority: {lead_info.get('priority_label')} ({lead_info.get('priority_score')}/100)
- Customer Inquiry: "{lead_info.get('customer_message')}"

AI ANALYSIS SUMMARY:
- Summary: {lead_info.get('ai_analysis', {}).get('summary')}
- Intent: {lead_info.get('ai_analysis', {}).get('intent')}
- Key Requirements: {', '.join(lead_info.get('ai_analysis', {}).get('key_requirements', []))}
- Objections: {', '.join(lead_info.get('ai_analysis', {}).get('objections', []))}
- Recommended Action: {lead_info.get('ai_analysis', {}).get('recommended_action')}
"""

        formatted_history = ""
        if history:
            formatted_history = "CONVERSATION HISTORY:\n" + "\n".join([f"{msg.sender.upper()}: {msg.text}" for msg in history]) + "\n"

        prompt = f"""
{COPILOT_SYSTEM_PROMPT}

{context_str}

{formatted_history}

SALESPERSON QUESTION: "{question}"

Provide a concise, practical, direct response grounded in the lead context above:
"""

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "temperature": 0.3
                    }
                )
                return response.text or "I couldn't process that question right now."
            except Exception as e:
                logger.error(f"Gemini Copilot API error: {e}")
                return self._fallback_copilot_response(lead_info, question)
        else:
            return self._fallback_copilot_response(lead_info, question)

    def _clean_json_string(self, text: str) -> str:
        """Strips markdown code blocks (```json ... ```) and whitespace."""
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
            text = re.sub(r"\n?```$", "", text)
        return text.strip()

    def _fallback_analysis(self, lead: LeadCreate) -> AIAnalysisResult:
        """Intelligent fallback structured analysis if AI API is unavailable."""
        msg_lower = lead.customer_message.lower()
        req_lower = lead.property_requirement.lower()
        tl_lower = lead.buying_timeline.lower()

        # Heuristic scoring calculations for fallback
        intent_score = 75
        if "ready" in msg_lower or "immediate" in tl_lower or "30 days" in tl_lower or "urgent" in msg_lower:
            intent_score = 90
        elif "exploring" in msg_lower or "just looking" in msg_lower:
            intent_score = 40

        timeline_score = 70
        if "30 days" in tl_lower or "immediate" in tl_lower or "lease ends" in msg_lower:
            timeline_score = 95
        elif "6 months" in tl_lower or "future" in tl_lower:
            timeline_score = 35

        requirement_score = 80 if len(lead.property_requirement) > 10 else 50
        budget_clarity_score = 85 if any(char.isdigit() for char in lead.budget) else 45

        return AIAnalysisResult(
            summary=f"Inquiry from {lead.name} seeking {lead.property_requirement} in {lead.location} within {lead.buying_timeline}.",
            intent="Urgent Ready-to-Move Buyer" if intent_score >= 80 else "Standard Property Inquiry",
            intent_score=intent_score,
            timeline_score=timeline_score,
            requirement_score=requirement_score,
            budget_clarity_score=budget_clarity_score,
            key_requirements=[
                f"Location: {lead.location}",
                f"Type: {lead.property_requirement}",
                f"Budget Limit: {lead.budget}"
            ],
            objections=[
                "Potential price negotiation expected",
                "Requires confirmation on possession date/ready status"
            ],
            recommended_action=f"Call {lead.name} immediately to share 2-3 verified listings matching {lead.property_requirement} in {lead.location}.",
            suggested_response=f"Hi {lead.name}, thank you for reaching out regarding your requirement for a {lead.property_requirement} in {lead.location}. I have 2 premium options within your budget of {lead.budget} available right now. When would be a good time for a quick 5-minute call today?",
            priority_reasons=[
                f"Timeline specified as '{lead.buying_timeline}'",
                f"Budget clear at {lead.budget}",
                f"Specific property request: {lead.property_requirement}"
            ]
        )

    def _fallback_copilot_response(self, lead_info: Dict[str, Any], question: str) -> str:
        q_lower = question.lower()
        name = lead_info.get("name", "the customer")
        budget = lead_info.get("budget", "stated budget")
        location = lead_info.get("location", "the location")
        req = lead_info.get("property_requirement", "their requirement")
        action = lead_info.get("ai_analysis", {}).get("recommended_action", "Call customer")
        
        if "emphasize" in q_lower or "call" in q_lower or "pitch" in q_lower:
            return f"**Key Talking Points for {name}:**\n- Highlight properties in **{location}** that strictly match **{req}**.\n- Emphasize immediate availability to align with their **{lead_info.get('buying_timeline')}** timeline.\n- Assure them of transparency regarding **{budget}** pricing."
        elif "concern" in q_lower or "objection" in q_lower:
            return f"**Primary Concerns to Address:**\n- Ensuring property readiness within **{lead_info.get('buying_timeline')}**.\n- Confirming that total all-inclusive costs stay within **{budget}**."
        elif "reply" in q_lower or "assertive" in q_lower or "message" in q_lower:
            return f"**Suggested Assertive Reply:**\n\"Hi {name}, I have identified 2 units in {location} matching your {req} requirement under {budget}. These units are receiving high interest due to the timeline. Can we schedule a 5-minute call today at 3 PM to review photos?\""
        else:
            return f"**Copilot Advice for {name}:**\nBased on this lead's profile ({lead_info.get('priority_label')} priority score: {lead_info.get('priority_score')}), your next best step is: **{action}**."

ai_service = AIService()

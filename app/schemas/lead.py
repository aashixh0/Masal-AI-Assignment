from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class CalendarState(BaseModel):
    scheduled: bool = False
    event_id: Optional[str] = None
    event_url: Optional[str] = None
    scheduled_at: Optional[str] = None

class AIAnalysisResult(BaseModel):
    summary: str = Field(description="Brief summary of the lead")
    intent: str = Field(description="Primary intent of the customer e.g. Urgent Buyer, Investor, Window Shopper")
    intent_score: int = Field(ge=0, le=100, description="Score 0-100 representing strength of purchase intent")
    timeline_score: int = Field(ge=0, le=100, description="Score 0-100 representing urgency of timeline")
    requirement_score: int = Field(ge=0, le=100, description="Score 0-100 representing clarity and specificity of property requirements")
    budget_clarity_score: int = Field(ge=0, le=100, description="Score 0-100 representing budget realism and clarity")
    key_requirements: List[str] = Field(default_factory=list, description="List of explicit property feature requests")
    objections: List[str] = Field(default_factory=list, description="Identified objections, concerns, or risks")
    recommended_action: str = Field(description="Recommended next best action for salesperson")
    suggested_response: str = Field(description="Draft response message for salesperson to send to customer")
    priority_reasons: List[str] = Field(default_factory=list, description="Bullet points explaining priority assignment")

class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, example="Rahul Sharma")
    location: str = Field(..., example="Mumbai, Andheri East")
    property_requirement: str = Field(..., example="3 BHK ready-to-move apartment near metro")
    budget: str = Field(..., example="₹1.8 Cr")
    buying_timeline: str = Field(..., example="Within 30 days")
    customer_message: str = Field(..., min_length=5, example="Looking for a 3 BHK in Andheri or Powai under 1.8 Cr. Need ready-to-move because my rent lease ends next month. Please share properties near metro.")

class LeadResponse(BaseModel):
    id: str
    name: str
    location: str
    property_requirement: str
    budget: str
    buying_timeline: str
    customer_message: str
    
    # Priority & AI Analysis
    priority_score: float
    priority_label: str  # HOT, WARM, COLD
    priority_reasons: List[str]
    ai_analysis: AIAnalysisResult
    
    # Integration
    calendar: CalendarState
    created_at: str

class CopilotChatMessage(BaseModel):
    sender: str # "user" or "assistant"
    text: str

class CopilotRequest(BaseModel):
    question: str
    history: List[CopilotChatMessage] = Field(default_factory=list)

class CopilotResponse(BaseModel):
    answer: str
    lead_id: str

class CalendarScheduleRequest(BaseModel):
    date: str # YYYY-MM-DD
    time: str # HH:MM (24h)
    duration_minutes: int = 30
    include_talking_points: bool = True
    include_suggested_response: bool = True
    custom_notes: Optional[str] = None

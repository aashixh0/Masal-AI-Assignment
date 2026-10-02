from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.lead import (
    LeadCreate, LeadResponse, CopilotRequest, CopilotResponse
)
from app.services.lead_service import lead_service

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(lead_in: LeadCreate):
    """Creates a new lead, triggers AI analysis & deterministic scoring, returns full lead response."""
    return lead_service.create_lead(lead_in)

@router.get("", response_model=List[LeadResponse])
def get_leads():
    """Returns all leads sorted by priority score descending."""
    return lead_service.get_all_leads()

@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str):
    """Returns a single lead by ID."""
    lead = lead_service.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found.")
    return lead

@router.post("/{lead_id}/copilot", response_model=CopilotResponse)
def ask_copilot(lead_id: str, req: CopilotRequest):
    """Asks a question to the conversational AI Copilot, grounded in the selected lead's context."""
    answer = lead_service.copilot_ask(lead_id, req.question, req.history)
    if not answer:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found.")
    return CopilotResponse(answer=answer, lead_id=lead_id)

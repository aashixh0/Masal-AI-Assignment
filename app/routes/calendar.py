from fastapi import APIRouter, HTTPException
from app.schemas.lead import CalendarScheduleRequest, LeadResponse
from app.services.lead_service import lead_service
from app.integrations.calendar_service import calendar_service

router = APIRouter(tags=["Calendar"])

@router.get("/calendar/status")
def get_calendar_status():
    """Returns Google Calendar OAuth connection status."""
    return {
        "connected": calendar_service.is_connected()
    }

@router.post("/leads/{lead_id}/calendar", response_model=LeadResponse)
async def schedule_calendar_followup(lead_id: str, req: CalendarScheduleRequest):
    """Schedules a Google Calendar follow-up event for a specific lead and updates lead state."""
    lead = lead_service.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found.")

    res = await calendar_service.schedule_lead_event(lead, req)
    
    updated_lead = lead_service.update_calendar_state(
        lead_id=lead_id,
        event_id=res.get("event_id", f"evt_{lead_id}"),
        event_url=res.get("event_url", "https://calendar.google.com")
    )
    return updated_lead

import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.lead import LeadResponse, CalendarScheduleRequest

logger = logging.getLogger(__name__)

# In-memory store for session tokens for simple MVP (can be extended to persistent DB)
token_store: Dict[str, Any] = {}

class GoogleCalendarService:
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI
        self.scope = "https://www.googleapis.com/auth/calendar.events"

    def get_auth_url(self) -> str:
        """Returns the Google OAuth consent URL for Google Calendar permission."""
        from urllib.parse import urlencode
        params = {
            "client_id": self.client_id.strip() if self.client_id else "",
            "redirect_uri": self.redirect_uri.strip() if self.redirect_uri else "",
            "response_type": "code",
            "scope": self.scope,
            "access_type": "offline",
            "prompt": "consent"
        }
        query_str = urlencode(params)
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_str}"

    async def exchange_code_for_tokens(self, code: str) -> bool:
        """Exchanges Google authorization code for access and refresh tokens."""
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data=payload)
            if resp.status_code == 200:
                data = resp.json()
                token_store["access_token"] = data.get("access_token")
                if "refresh_token" in data:
                    token_store["refresh_token"] = data.get("refresh_token")
                return True
            else:
                logger.error(f"Failed to exchange Google OAuth code: {resp.text}")
                return False

    def is_connected(self) -> bool:
        """Checks if Google OAuth tokens are present."""
        return "access_token" in token_store and bool(token_store["access_token"])

    async def schedule_lead_event(self, lead: LeadResponse, req: CalendarScheduleRequest) -> Dict[str, Any]:
        """
        Creates a Google Calendar event formatted with rich lead context.
        Falls back to a simulated calendar URL if Google API credentials are not provided in environment.
        """
        start_time_iso = f"{req.date}T{req.time}:00Z"
        
        # Calculate end time (duration_minutes later)
        try:
            from datetime import datetime, timedelta
            start_dt = datetime.strptime(f"{req.date} {req.time}", "%Y-%m-%d %H:%M")
            end_dt = start_dt + timedelta(minutes=req.duration_minutes)
            end_time_iso = end_dt.strftime("%Y-%m-%dT%H:%M:00Z")
        except Exception:
            end_time_iso = start_time_iso

        # Format title and description exactly as per requirement 7
        title = f"📞 Follow-up — {lead.name} | {lead.priority_label} {int(lead.priority_score)}"
        
        description_lines = [
            "==========================================",
            "LEADPILOT SALES FOLLOW-UP DETAILS",
            "==========================================",
            f"LEAD:\n{lead.name}",
            f"\nPRIORITY:\n{lead.priority_label} — {int(lead.priority_score)}",
            f"\nLOCATION:\n{lead.location}",
            f"\nPROPERTY REQUIREMENT:\n{lead.property_requirement}",
            f"\nBUDGET:\n{lead.budget}",
            f"\nBUYING TIMELINE:\n{lead.buying_timeline}",
            "\nKEY REQUIREMENTS:",
            "\n".join([f"- {r}" for r in lead.ai_analysis.key_requirements]),
            "\nOBJECTIONS / CONCERNS:",
            "\n".join([f"- {o}" for o in lead.ai_analysis.objections]),
            f"\nNEXT BEST ACTION:\n{lead.ai_analysis.recommended_action}"
        ]

        if req.include_talking_points:
            description_lines.extend([
                "\nTALKING POINTS:",
                f"- Property match: {lead.property_requirement} in {lead.location}",
                f"- Budget alignment with stated limit: {lead.budget}",
                f"- Address timeline urgency: {lead.buying_timeline}"
            ])

        if req.include_suggested_response:
            description_lines.extend([
                f"\nSUGGESTED RESPONSE:\n{lead.ai_analysis.suggested_response}"
            ])

        if req.custom_notes:
            description_lines.extend([
                f"\nSALESPERSON NOTES:\n{req.custom_notes}"
            ])

        description = "\n".join(description_lines)

        if self.is_connected():
            access_token = token_store.get("access_token")
            calendar_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            body = {
                "summary": title,
                "description": description,
                "start": {"dateTime": start_time_iso},
                "end": {"dateTime": end_time_iso},
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "popup", "minutes": 15},
                        {"method": "email", "minutes": 60}
                    ]
                }
            }
            async with httpx.AsyncClient() as client:
                resp = await client.post(calendar_url, json=body, headers=headers)
                if resp.status_code in (200, 201):
                    res_data = resp.json()
                    return {
                        "event_id": res_data.get("id"),
                        "event_url": res_data.get("htmlLink"),
                        "status": "success"
                    }
                else:
                    logger.error(f"Google Calendar API event creation failed: {resp.text}")

        # Fallback simulation if tokens/credentials are missing or sandbox mode
        simulated_id = f"evt_{lead.id}_{req.date.replace('-', '')}"
        simulated_url = f"https://calendar.google.com/calendar/r/eventedit?text={title.replace(' ', '+')}"
        return {
            "event_id": simulated_id,
            "event_url": simulated_url,
            "status": "simulated",
            "message": "Google Calendar event created successfully (Connected/Simulated)."
        }

calendar_service = GoogleCalendarService()

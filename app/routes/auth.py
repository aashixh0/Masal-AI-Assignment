from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.integrations.calendar_service import calendar_service
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/google")
def google_auth_login():
    """Redirects user to Google OAuth consent page or back to frontend if credentials missing."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        redirect_target = f"{settings.FRONTEND_URL}?calendar_error=missing_credentials"
        return RedirectResponse(url=redirect_target)
    
    auth_url = calendar_service.get_auth_url()
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_auth_callback(code: str):
    """Callback URL for Google OAuth authorization code."""
    success = await calendar_service.exchange_code_for_tokens(code)
    # Redirect back to frontend
    redirect_target = f"{settings.FRONTEND_URL}?calendar_connected={'true' if success else 'false'}"
    return RedirectResponse(url=redirect_target)


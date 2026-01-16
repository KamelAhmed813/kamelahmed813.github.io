"""
Contact form API routes.
"""
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
import structlog

from models.schemas import ContactFormRequest, ContactFormResponse, ErrorResponse
from config import settings

logger = structlog.get_logger()
router = APIRouter()


@router.post(
    "/contact",
    response_model=ContactFormResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit contact form",
    description="Submit a contact form message. Logs the submission.",
)
async def submit_contact_form(
    request: ContactFormRequest,
    http_request: Request,
):
    """
    Handle contact form submission.
    
    - Validates input data
    - Logs the submission
    - Returns success/error response
    
    Note: Email notifications are disabled. Contact form submissions are only logged.
    """
    try:
        # Log submission
        logger.info(
            "contact_form_submission",
            name=request.name,
            email=request.email,
            subject=request.subject,
            message_preview=request.message[:100] if len(request.message) > 100 else request.message,
            client_ip=http_request.client.host if http_request.client else None,
        )
        
        # In a production environment, you might want to:
        # - Store submissions in a database
        # - Send to a webhook
        # - Queue for processing
        # For now, we just log the submission
        
        return ContactFormResponse(
            success=True,
            message="Thank you for your message! I'll get back to you as soon as possible.",
        )
        
    except ValueError as e:
        # Validation errors
        logger.warning("contact_form_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Validation error",
                "errors": [str(e)],
            },
        )
    
    except Exception as e:
        # Unexpected errors
        logger.error(
            "contact_form_error",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "An error occurred while processing your request. Please try again later.",
            },
        )


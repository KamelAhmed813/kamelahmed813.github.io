"""
Chat API routes for AI conversation.
"""
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
from datetime import datetime
import structlog

from models.schemas import ChatMessageRequest, ChatMessageResponse, ErrorResponse
from services.ai_service import ai_service
from services.session_manager import session_manager

logger = structlog.get_logger()
router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Send chat message",
    description="Send a message to the AI persona and receive a response.",
)
async def send_chat_message(
    request: ChatMessageRequest,
    http_request: Request,
):
    """
    Handle chat message and return AI response.
    
    - Creates or retrieves chat session
    - Maintains conversation history
    - Gets AI response based on context
    - Returns formatted response
    """
    try:
        # Get or create session
        if not request.session_id:
            session_id = session_manager.create_session()
        else:
            session = session_manager.get_session(request.session_id)
            if not session:
                # Session expired, create new one
                session_id = session_manager.create_session()
            else:
                session_id = request.session_id
        
        # Set language preference
        if request.language:
            session_manager.set_session_language(session_id, request.language)
        
        # Add user message to session
        session_manager.add_message_to_session(
            session_id=session_id,
            role="user",
            content=request.message,
        )
        
        # Get conversation history
        conversation_history = session_manager.get_conversation_history(session_id)
        
        # Get AI response
        ai_response = await ai_service.get_chat_response(
            user_message=request.message,
            conversation_history=conversation_history,
            language=request.language or "en",
        )
        
        # Add AI response to session
        session_manager.add_message_to_session(
            session_id=session_id,
            role="assistant",
            content=ai_response,
        )
        
        logger.info(
            "chat_message_processed",
            session_id=session_id,
            message_length=len(request.message),
            response_length=len(ai_response),
            client_ip=http_request.client.host if http_request.client else None,
        )
        
        return ChatMessageResponse(
            message=ai_response,
            session_id=session_id,
            timestamp=datetime.now(),
        )
        
    except ValueError as e:
        logger.warning("chat_validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Validation error",
                "errors": [str(e)],
            },
        )
    
    except Exception as e:
        logger.error(
            "chat_error",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "An error occurred while processing your message. Please try again later.",
            },
        )


@router.get(
    "/chat/history/{session_id}",
    summary="Get chat history",
    description="Retrieve conversation history for a session (optional, for future use).",
)
async def get_chat_history(session_id: str):
    """
    Get chat history for a session.
    Currently returns basic info. Can be extended to return full history.
    """
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": "Session not found or expired",
            },
        )
    
    return {
        "success": True,
        "session_id": session_id,
        "message_count": len(session["messages"]),
        "created_at": session["created_at"].isoformat(),
        "last_activity": session["last_activity"].isoformat(),
    }


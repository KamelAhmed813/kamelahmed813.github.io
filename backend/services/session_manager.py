"""
Session manager for chat conversations.
Stores conversation history in memory (can be extended to use database).
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid
import structlog

logger = structlog.get_logger()


class SessionManager:
    """Manages chat sessions and conversation history."""
    
    def __init__(self, session_timeout_minutes: int = 30):
        self.sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
    
    def create_session(self) -> str:
        """Create a new chat session and return session ID."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "messages": [],
            "language": "en",
        }
        logger.info("session_created", session_id=session_id)
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data by session ID."""
        session = self.sessions.get(session_id)
        
        if not session:
            return None
        
        # Check if session has expired
        if datetime.now() - session["last_activity"] > self.session_timeout:
            logger.info("session_expired", session_id=session_id)
            del self.sessions[session_id]
            return None
        
        return session
    
    def update_session_activity(self, session_id: str):
        """Update last activity timestamp for session."""
        if session_id in self.sessions:
            self.sessions[session_id]["last_activity"] = datetime.now()
    
    def add_message_to_session(
        self,
        session_id: str,
        role: str,
        content: str,
    ):
        """Add message to session conversation history."""
        if session_id not in self.sessions:
            return
        
        self.sessions[session_id]["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })
        
        # Keep only last 20 messages to prevent memory issues
        if len(self.sessions[session_id]["messages"]) > 20:
            self.sessions[session_id]["messages"] = self.sessions[session_id]["messages"][-20:]
        
        self.update_session_activity(session_id)
    
    def get_conversation_history(self, session_id: str) -> List[Dict[str, str]]:
        """Get conversation history for session."""
        session = self.get_session(session_id)
        if not session:
            return []
        
        # Return messages in format expected by AI service
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in session["messages"][:-1]  # Exclude last message (current user message)
        ]
    
    def set_session_language(self, session_id: str, language: str):
        """Set language preference for session."""
        if session_id in self.sessions:
            self.sessions[session_id]["language"] = language
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions."""
        now = datetime.now()
        expired_sessions = [
            session_id
            for session_id, session in self.sessions.items()
            if now - session["last_activity"] > self.session_timeout
        ]
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
            logger.info("session_cleaned_up", session_id=session_id)
    
    def get_session_count(self) -> int:
        """Get current number of active sessions."""
        return len(self.sessions)


# Global session manager instance
session_manager = SessionManager()


"""
AI service for chat functionality using LangGraph with Google Gemini.
Implements an agent-based chat completion system.
"""
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import structlog
from config import settings
from typing import List, Dict, Optional, TypedDict, Annotated
import os
import asyncio
from operator import add

logger = structlog.get_logger()


class ChatState(TypedDict):
    """State for the LangGraph chat agent."""
    messages: Annotated[List, add]  # Accumulate messages


class AIService:
    """Service for AI chat functionality using LangGraph agent with Google Gemini."""
    
    def __init__(self):
        self.api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = settings.gemini_model
        self.temperature = settings.ai_temperature
        self.max_tokens = settings.ai_max_tokens
        
        if not self.api_key:
            logger.warning("gemini_api_key_missing", message="AI service not configured")
            self.llm = None
            self.agent = None
        else:
            try:
                # Initialize Google Gemini LLM
                self.llm = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.api_key,
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                )
                
                # Load system prompt from file
                self.system_prompt = self._load_system_prompt()
                
                # Build LangGraph agent
                self.agent = self._build_agent()
                
                logger.info("langgraph_agent_initialized", model=self.model_name)
            except Exception as e:
                logger.error("ai_initialization_failed", error=str(e), exc_info=True)
                self.llm = None
                self.agent = None
    
    def _load_system_prompt(self) -> str:
        """Load system prompt from static file."""
        try:
            # Try to load from data directory (relative to backend)
            prompt_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "data",
                "system_prompt.txt"
            )
            
            if os.path.exists(prompt_path):
                with open(prompt_path, "r", encoding="utf-8") as f:
                    prompt = f.read().strip()
                logger.info("system_prompt_loaded", path=prompt_path)
                return prompt
            else:
                logger.warning("system_prompt_file_not_found", path=prompt_path)
                return "You are a helpful AI assistant."
        except Exception as e:
            logger.error("failed_to_load_system_prompt", error=str(e), exc_info=True)
            return "You are a helpful AI assistant."
    
    def _build_agent(self) -> StateGraph:
        """Build LangGraph agent for chat completion."""
        
        def chat_node(state: ChatState):
            """Node that handles chat completion."""
            messages = state.get("messages", [])
            
            # Add system message if not already present
            if not messages or not isinstance(messages[0], SystemMessage):
                system_msg = SystemMessage(content=self.system_prompt)
                messages = [system_msg] + messages
            
            # Get response from LLM
            response = self.llm.invoke(messages)
            
            # Return AI response to be added to messages (reducer will accumulate)
            return {"messages": [response]}
        
        # Create the graph
        workflow = StateGraph(ChatState)
        
        # Add the chat node
        workflow.add_node("chat", chat_node)
        
        # Set entry point
        workflow.set_entry_point("chat")
        
        # Connect to END
        workflow.add_edge("chat", END)
        
        # Compile the graph
        return workflow.compile()
    
    async def get_chat_response(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
    ) -> str:
        """
        Get AI response to user message using LangGraph agent.
        
        Args:
            user_message: User's message
            conversation_history: Previous messages in conversation
            language: Language preference (en/ar)
            
        Returns:
            AI response message
        """
        if not self.agent or not self.llm:
            return "I'm sorry, the AI service is not currently available. Please try again later or use the contact form."
        
        try:
            # Convert conversation history to LangChain messages
            messages = []
            
            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role == "user":
                        messages.append(HumanMessage(content=content))
                    elif role == "assistant":
                        messages.append(AIMessage(content=content))
            
            # Add current user message
            messages.append(HumanMessage(content=user_message))
            
            # Prepare state for LangGraph
            initial_state = {"messages": messages}
            
            # Run the agent asynchronously
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.agent.invoke(initial_state)
            )
            
            # Extract the AI response (last message should be from AI)
            if result and "messages" in result and len(result["messages"]) > 0:
                # Get the last message which should be the AI response
                last_message = result["messages"][-1]
                if hasattr(last_message, 'content'):
                    ai_response = last_message.content.strip()
                elif isinstance(last_message, dict) and 'content' in last_message:
                    ai_response = last_message['content'].strip()
                else:
                    ai_response = str(last_message).strip()
            else:
                ai_response = "I'm sorry, I didn't receive a valid response."
            
            logger.info(
                "ai_response_generated",
                model=self.model_name,
                has_history=conversation_history is not None and len(conversation_history) > 0,
            )
            
            return ai_response
            
        except Exception as e:
            logger.error(
                "ai_request_failed",
                error=str(e),
                error_type=type(e).__name__,
                exc_info=True,
            )
            return "I'm sorry, I encountered an error processing your message. Please try again later."
    
    def format_message_for_history(self, role: str, content: str) -> Dict[str, str]:
        """Format message for conversation history."""
        return {"role": role, "content": content}


# Global AI service instance
ai_service = AIService()

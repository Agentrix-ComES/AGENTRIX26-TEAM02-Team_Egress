"""Guardrail node: Checks the user's input for safety and relevance."""
import logging
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.prompts import GUARDRAIL_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.schemas.ai import GuardrailDecision

logger = logging.getLogger(__name__)


async def guardrail(state: GraphState) -> GraphState:
    """Evaluate if the user's latest message is safe and relevant."""
    
    # Get the latest user message
    messages = state.get("messages", [])
    if not messages:
        return {"is_safe": True}
        
    latest_msg = messages[-1]
    if not isinstance(latest_msg, HumanMessage):
        return {"is_safe": True}

    # We use the fastest tertiary model for guardrailing to minimize latency
    model = get_chat_model("tertiary").with_structured_output(GuardrailDecision)
    
    logger.info("Evaluating message safety...")
    
    try:
        result: GuardrailDecision = await model.ainvoke([
            SystemMessage(content=GUARDRAIL_SYSTEM_PROMPT),
            latest_msg
        ])
        
        logger.info(f"Guardrail decision: safe={result.is_safe}, reason={result.reason}")
        
        if not result.is_safe:
            reject_msg = "I am an AI travel assistant for Sri Lanka. I cannot assist with that request."
            if result.reason:
                logger.warning(f"Message rejected by guardrail: {result.reason}")
                
            return {
                "is_safe": False,
                "reply": reject_msg,
                "messages": [AIMessage(content=reject_msg)]
            }
            
        return {"is_safe": True}
        
    except Exception as e:
        logger.error(f"Guardrail evaluation failed, failing open (safe): {e}")
        # If the guardrail fails for some API reason, we default to safe 
        # and let the native Gemini safety settings handle severe violations.
        return {"is_safe": True}

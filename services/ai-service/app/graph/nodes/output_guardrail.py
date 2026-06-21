"""Output Guardrail node: Checks the final generated output before sending to the user."""
import json
import logging
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.prompts import OUTPUT_GUARDRAIL_SYSTEM_PROMPT
from app.graph.llm import get_chat_model
from app.graph.state import GraphState
from app.schemas.ai import OutputGuardrailDecision

logger = logging.getLogger(__name__)


async def output_guardrail(state: GraphState) -> GraphState:
    """Evaluate the final generated reply and itinerary for safety."""
    
    reply = state.get("reply", "")
    itinerary = state.get("itinerary", {})
    
    if not reply and not itinerary:
        return state
        
    # Construct the content to be evaluated
    eval_parts = [f"Generated Reply: {reply}"]
    if itinerary:
        eval_parts.append(f"Generated Itinerary: {json.dumps(itinerary, ensure_ascii=False)[:3000]}")
        
    eval_text = "\n\n".join(eval_parts)

    # We use the fastest tertiary model for guardrailing to minimize latency
    model = get_chat_model("tertiary").with_structured_output(OutputGuardrailDecision)
    
    logger.info("Evaluating output safety...")
    
    try:
        result: OutputGuardrailDecision = await model.ainvoke([
            SystemMessage(content=OUTPUT_GUARDRAIL_SYSTEM_PROMPT),
            HumanMessage(content=eval_text)
        ])
        
        logger.info(f"Output Guardrail decision: safe={result.is_safe}")
        
        if not result.is_safe:
            fallback = result.safe_fallback_reply or "I encountered a safety policy violation while generating your response and had to redact it. I apologize for the inconvenience."
            logger.warning("Output rejected by guardrail. Applying fallback.")
            
            # If it's unsafe, we replace the reply and delete the itinerary
            # to guarantee no unsafe content leaks to the frontend UI.
            return {
                "reply": fallback,
                "itinerary": {},
                "messages": [AIMessage(content=fallback)]
            }
            
        return state
        
    except Exception as e:
        logger.error(f"Output Guardrail evaluation failed, failing open (safe): {e}")
        return state

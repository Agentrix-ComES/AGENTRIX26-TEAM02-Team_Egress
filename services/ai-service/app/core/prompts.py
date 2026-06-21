"""Prompt templates and system prompts for agent nodes."""
import pathlib

_PROMPTS_DIR = pathlib.Path(__file__).parent / "prompts"

def _load_prompt(filename: str) -> str:
    """Load a prompt from the given file in the prompts directory."""
    with open(_PROMPTS_DIR / filename, "r", encoding="utf-8") as f:
        return f.read().strip()

INTENT_SYSTEM_PROMPT = _load_prompt("intent_system.md")
PLANNER_SYSTEM_PROMPT = _load_prompt("planner_system.md")
LOGISTICS_SYSTEM_PROMPT = _load_prompt("logistics_system.md")
DISRUPTION_SYSTEM_PROMPT = _load_prompt("disruption_system.md")
CULTURE_SYSTEM_PROMPT = _load_prompt("culture_system.md")
CHAT_SYSTEM_PROMPT = _load_prompt("chat_system.md")
GUARDRAIL_SYSTEM_PROMPT = _load_prompt("guardrail_system.md")
OUTPUT_GUARDRAIL_SYSTEM_PROMPT = _load_prompt("output_guardrail_system.md")

"""D-018 Mellea Instruct-Validate-Repair tri-agent critic orchestrator.

3 parallel critic agents (physics + pedagogy + guardian_safety) each
issue a verdict on a coaching report. Verdicts aggregate into the
`TriAgentVerdict` shape the frontend `TriAgentCriticPanel` consumes.
"""

from apex.critics.orchestrator import run_tri_agent_critics

__all__ = ["run_tri_agent_critics"]

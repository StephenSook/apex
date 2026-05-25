"""Granite Guardian 4.1 BYOC custom-rules audit layer.

Reads a PhysicsViolationLog + CoaParseResult, applies a BYOC rule
registry, emits a GuardianAudit discriminated union (approve | flag |
reject) that mirrors the canonical frontend contract at
`app/shared/types.ts` L323-345.
"""

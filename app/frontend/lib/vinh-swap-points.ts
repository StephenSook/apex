/**
 * Vinh M3 swap-point single source of truth. Wave-45 deep-review
 * code-reviewer NIT N-2 close: 4 wave-45 API route stubs embed swap-
 * point strings as inline literals; centralize so a Vinh-side path
 * rename only edits this file.
 *
 * Consumers: app/api/projector-stage-a/route.ts + projector-stage-b +
 * orchestration + lips-harness. Stage A + Stage B + LangGraph + LIPS
 * canned-fallback routes import the matching swap_point constant +
 * header value.
 */

export const VINH_SWAP_POINTS = {
  V12_PACEJKA: {
    swap_point:
      "Vinh M3-V12 -> app/backend/apex/physics/projection_pacejka.py (DifferentiableProjector Protocol)",
    header: "vinh-m3-v12-pacejka-linearization",
  },
  V13_SCP: {
    swap_point:
      "Vinh M3-V13 -> app/backend/apex/physics/projection_scp.py (3-iterate SCP wrap of Stage A)",
    header: "vinh-m3-v13-scp-3-iterate",
  },
  V14_LANGGRAPH: {
    swap_point:
      "Vinh M3-V14 -> app/backend/apex/orchestration/langgraph_runtime.py (D-017 G7 + D-026 + D-054 LangGraph + MCP + ContextForge)",
    header: "vinh-m3-v14-langgraph",
  },
  V15_LIPS: {
    swap_point:
      "Vinh M3-V15 -> eval/Dockerfile + apex-bench/ (D-026 + G10 reproducibility statement)",
    header: "vinh-m3-v15-lips-4-axis",
  },
  V7_TSPULSE: {
    swap_point:
      "Vinh M3-V7 -> app/backend/apex/tspulse/anomaly.py (D-016 Layer 2 polyphase anomaly detector)",
    header: "vinh-m3-v7-tspulse-anomaly",
  },
  V8_EMBEDDING: {
    swap_point:
      "Vinh M3-V8 -> app/backend/apex/embedding/rag_retrieve.py (Granite Embedding R2 cosine-similarity over precomputed corpus)",
    header: "vinh-m3-v8-embedding-r2-rag",
  },
  V9_WATSON_STT: {
    swap_point:
      "Vinh M3-V9 -> app/backend/apex/speech/stt_proxy.py (Watson STT proxy via Granite Speech 4.1 2B-Plus on vLLM serve; speaker-attributed ASR + word-level timestamps)",
    header: "vinh-m3-v9-watson-stt-granite-speech-4-1-2b-plus",
  },
} as const;

export type VinhSwapPoint = keyof typeof VINH_SWAP_POINTS;

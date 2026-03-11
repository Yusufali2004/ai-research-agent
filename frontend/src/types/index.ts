// ─────────────────────────────────────────────
//  All shared TypeScript interfaces & enums
// ─────────────────────────────────────────────

export type OrbState = 'idle' | 'listening' | 'speaking';

export type MessageRole = 'user' | 'agent' | 'tool';

export type AgentStepStatus = 'pending' | 'active' | 'done';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface AgentStep {
  id: number;
  label: string;
  status: AgentStepStatus;
}

// Messages coming in over WebSocket from backend
export type WsMessageType =
  | 'audio'
  | 'agent_transcript'
  | 'user_transcript'
  | 'tool_use'
  | 'turn_complete'
  | 'error';

export interface WsMessage {
  type: WsMessageType;
  data?: string;        // base64 audio
  mime_type?: string;
  text?: string;        // transcript text
  tool?: string;        // tool name
  status?: string;
  message?: string;     // error message
}

// Messages sent from frontend to backend
export type WsOutgoingType = 'audio' | 'text' | 'end_turn';

export interface WsOutgoing {
  type: WsOutgoingType;
  data?: string;   // base64 audio
  text?: string;   // text fallback
}

// Tool name → step number mapping
export const TOOL_STEP_MAP: Record<string, number> = {
  plan_research_subtopics:    1,
  google_search:              2,
  format_research_summary:    3,
  suggest_followup_questions: 5,
};

// Tool name → human readable label
export const TOOL_LABEL_MAP: Record<string, string> = {
  plan_research_subtopics:    '🧠 Planning research structure...',
  google_search:              '🌐 Searching the web...',
  format_research_summary:    '📝 Synthesizing findings...',
  suggest_followup_questions: '💡 Generating follow-up questions...',
};

export const INITIAL_STEPS: AgentStep[] = [
  { id: 1, label: 'Plan research subtopics',  status: 'pending' },
  { id: 2, label: 'Search web sources',       status: 'pending' },
  { id: 3, label: 'Synthesize findings',      status: 'pending' },
  { id: 4, label: 'Find papers & resources',  status: 'pending' },
  { id: 5, label: 'Generate project ideas',   status: 'pending' },
];
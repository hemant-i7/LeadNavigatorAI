export interface IncomingMessage {
  phone: string;
  messageText: string;
  customerName?: string;
  timestamp?: string;
  phoneNumberId?: string;
  language?: string;
}

export interface AgentResponse {
  vertical: "Tourism" | "Car Rental" | "Unknown";
  category: string;
  confidence: number;
  escalate: boolean;
  escalationReason?: string | null;
  estimatedValue: "Low" | "Medium" | "High";
  customerMood: "Excited" | "Urgent" | "Confused" | "Neutral";
  response: string;
  staffBrief: string | null;
}

export interface LogEntry extends IncomingMessage, AgentResponse {
  id: string;
  loggedAt: string;
}

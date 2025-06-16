export interface Message {
  id: string;
  type: 'user' | 'agent' | 'system' | 'tool-call';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolEvent?: ToolEvent;
}

export interface ToolEvent {
  type: 'tool-call-start' | 'tool-call' | 'tool-result' | 'step-finish';
  toolName?: string;
  args?: any;
  result?: any;
  toolCallId?: string;
  isContinued?: boolean;
  timestamp: number;
}

export interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  toolEvents: ToolEvent[];
  setToolEvents: React.Dispatch<React.SetStateAction<ToolEvent[]>>;
}

export interface AppOptions {
  verbose?: boolean;
  config?: string;
  [key: string]: any;
}

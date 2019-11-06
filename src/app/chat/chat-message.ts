export class ChatMessage {
  type?: ChatMessageType = ChatMessageType.MESSAGE;
  sender: string;
  target: string;
  message: string;
  data?: any;
  timestamp?: number = Date.now();
  isLocal?: boolean;
  // data for visualization
  rendered = {} as {
    message?: string;
    flagsIconColor?: string;
    flagsIconName?: string;
    musicIcon?: string;
    date?: string;
  };
}

export enum ChatMessageType {
  MESSAGE,
  ACTION,
  JOIN,
  PART,
  KICK,
  QUIT,
  MODE
}

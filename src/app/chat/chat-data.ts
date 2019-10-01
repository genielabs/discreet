import {ChatInfo} from './chat-info';
import {ChatManagerComponent} from './chat-manager/chat-manager.component';
import {ChatUser} from './chat-user';

export class ChatData {
  topic = '';
  flags: string;
  mode: string;
  users: ChatUser[] = [] as ChatUser[];
  messages: ChatMessage[] = [];
  input: ChatInput = new ChatInput(this);
  stats = new ChatStats();
  status: any;

  readonly info: ChatInfo;
  private bufferMaxLines = 100;

  constructor(
    target: string | ChatInfo,
    private chatManager: ChatManagerComponent
  ) {
    if (target instanceof ChatInfo) {
      this.info = target;
    } else {
      this.info = new ChatInfo(target);
    }
  }

  // Public methods
  target(): ChatInfo {
    return this.info;
  }
  manager() {
    return this.chatManager;
  }
  send(message: string) {
    const name = this.target().name;
    // deliver message to this chat
    this.chatManager.client().send(name, message);
    // Add the outgoing message to the buffer as well
    this.receive({
      type: 'PRIVMSG',
      sender: '@localuser',
      target: name,
      message
    });
  }
  receive(message: ChatMessage) {
    // add incoming messages to the message buffer
    this.messages.push(message);
    if (this.messages.length > this.bufferMaxLines) {
      this.messages.pop();
    }
    // if this is not the current chat, then increase
    // the number of unread messages
    if (this.chatManager.currentChat == null || this.target().name !== this.chatManager.currentChat.name) {
      this.stats.messages.new++;
    }
  }
  hasUsers(): boolean {
    return this.users.length > 0;
  }
}

export class ChatInput {
  textInput = '';
  textBuffer: string[] = [];
  constructor(private chat: ChatData) {}
  getInput(): string {
    return this.textInput;
  }
  setInput(s: string) {
    this.textInput = s;
  }
  dispatch() {
    this.chat.send(this.textInput);
    this.textInput = '';
  }
}

export class ChatStats {
  users: {};
  messages = {
    new: 0
  };
}

export class ChatMessage {
  type: string;
  sender: string;
  target: string;
  message: string;
}

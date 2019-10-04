import {ChatInfo} from './chat-info';
import {ChatManagerComponent} from './chat-manager/chat-manager.component';
import {ChatUser} from './chat-user';
import {TextFormatting} from './text-formatting';

export class ChatData {
  topic = '';
  flags: string;
  mode: string;
  users: ChatUser[] = [] as ChatUser[];
  messages: ChatMessage[] = [];
  input: ChatInput = new ChatInput(this);
  stats = new ChatStats();
  status: any;
  timestamp = Date.now();

  readonly info: ChatInfo;
  private bufferMaxLines = 300;
  private textFormatting = new TextFormatting();

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
      sender: '<em>' + this.chatManager.client().config.nick + '</em>',
      target: name,
      message,
      formatted: message
    });
  }
  receive(message: ChatMessage) {
    // strip color codes (sorry... not supported yet =/)
    // TODO: add suport for IRC color codes
    message.formatted = message.message
      .replace(/(\u0002+)|(\u0003+)(\d{1,2})?(,(\d{1,2}))?/g, '');

    this.textFormatting.enrich(message.formatted)
      .subscribe((result) => {
        console.log(result);
        if (result.mediaInfo) {
          const sender = this.getUser(message.sender);
          console.log(message.sender, sender);
          if (sender) {
            sender.playlist.push(result.mediaInfo);
          }
        }
        message.formatted = result.enriched;
      });

    // add incoming messages to the message buffer
    this.messages.push(message);
    if (this.messages.length > this.bufferMaxLines) {
      this.messages.shift();
    }
    // if this is not the current chat, then increase
    // the number of unread messages
    if (this.chatManager.currentChat == null || this.target().name !== this.chatManager.currentChat.name) {
      this.stats.messages.new++;
    }
    this.timestamp = Date.now();
  }
  getUser(name: string) {
    return this.users.find((u) => u.name === name);
  }
  getUserIcon(name: string) {
    const u = this.getUser(name);
    return u != null && this.manager().getIcon(u.flags);
  }
  getUserColor(name: string) {
    const u = this.getUser(name);
    return u != null && this.manager().getColor(u.flags);
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
  formatted?: string;
  timestamp?: number = Date.now();
}

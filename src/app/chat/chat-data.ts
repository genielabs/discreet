import {ChatInfo} from './chat-info';
import {ChatManagerComponent} from './chat-manager/chat-manager.component';
import {ChatUser} from './chat-user';
import {TextFormatting} from './text-formatting';
import {ChatMessage, ChatMessageType} from './chat-message';

export class ChatData {
  topic = '';
  mode: string;
  hidden = false;
  users: ChatUser[] = [] as ChatUser[];
  messages: ChatMessage[] = [];
  stats = new ChatStats();
  timestamp = Date.now();
  preferences = {
    showChannelActivity: false,
    showChannelActivityToggle() {
      this.showChannelActivity = !this.showChannelActivity;
    }
  };

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
      type: ChatMessageType.MESSAGE,
      sender: this.chatManager.client().config.nick,
      target: name,
      message,
      rendered: {},
      isLocal: true
    });
  }
  receive(message: ChatMessage) {
    const senderUser = this.getUser(message.sender);

    message = Object.assign(new ChatMessage(), message);
    if (message.message.startsWith('\x01ACTION ') && message.message.endsWith('\x01')) {
      message.type = ChatMessageType.ACTION;
      message.message = message.message.slice(8, -1);
    }

    // strip color codes (sorry... not supported yet =/)
    // TODO: add suport for IRC color codes
    message.rendered.message = message.message
      .replace(/(\u0002+)|(\u0003+)(\d{1,2})?(,(\d{1,2}))?/g, '');

    this.textFormatting.enrich(message.rendered.message)
      .subscribe((result) => {
        if (result.mediaInfo) {
          const sender = this.getUser(message.sender);
          if (sender) {
            sender.playlist.push(result.mediaInfo);
          }
        }
        message.rendered.message = result.enriched;
        if (senderUser) {
          message.rendered.musicIcon = senderUser.playlist.length > 0 ? 'music_video' : '';
        }
      });

    message.rendered.flagsIconColor = this.getUserColor(message.sender);
    message.rendered.flagsIconName = this.getUserIcon(message.sender);
    if (message.rendered.flagsIconName === 'person') {
      // do not show standard use icon in message buffer
      message.rendered.flagsIconName = null;
    }

    // keep only 'bufferMaxLines' messages
    if (this.messages.length === this.bufferMaxLines) {
      this.messages.shift();
    }
    // add incoming messages to the message buffer
    this.messages.push(message);
    // if this is not the current chat, then increase
    // the number of unread messages
    if (message.type === ChatMessageType.MESSAGE && (
        this.chatManager.currentChatInfo == null ||
        this.target().name !== this.chatManager.currentChatInfo.name ||
        (this.target().name === this.chatManager.currentChatInfo.name && !this.chatManager.isLastMessageVisible())
      )
    ) {
      this.stats.messages.new++;
    }
    this.timestamp = Date.now();

    // scroll down to last visible message
    if (this.info === this.manager().currentChatInfo) {
      this.manager().scrollToLast();
    }
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

export class ChatStats {
  users: {};
  messages = {
    new: 0
  };
}

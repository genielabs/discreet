import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Injectable} from '@angular/core';

import {IrcClient} from '../../irc-client/irc-client';
import {MessagesWindowComponent} from '../messages-window/messages-window.component';
import {ChatHostDirective} from '../chat-host.directive';

class ChatData {
  name = '';
  topic = '';
  flags: any;
  users: string[] = [];
  messages: {type, sender, target, message}[] = [];
  status: any;

  hasUsers(): boolean {
    return this.users.length > 0;
  }
}

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  styleUrls: ['./chat-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChatManagerComponent implements OnInit {
  @ViewChild(ChatHostDirective, {static: true})
  private chatManagerHost: ChatHostDirective;
  @ViewChild(MessagesWindowComponent, {static: true})
  private messageWindow: MessagesWindowComponent;

  chatList: ChatData[] = [];
  currentChat;

  @Output() chatClosed = new EventEmitter<any>();
  @Output() chatOpen = new EventEmitter<any>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private ircClient: IrcClient
  ) {
    this.ircClient.messageReceive.subscribe((msg) => {
      const ni = msg.sender.indexOf('!');
      if (ni > 0 ) {
        msg.sender = msg.sender.substring(0, ni);
      }
      if (this.ircClient.config.nick === msg.target) {
        msg.target = msg.sender;
      }
      const chat = this.chat(msg.target);
      chat.messages.push(msg);
      this.messageWindow.onNewMessage(msg);
    });
    this.ircClient.usersList.subscribe((msg) => {
      console.log('####', this.chat(msg.target))
      const userList = this.chat(msg.target).users;
      switch (msg.action) {
        case 'LIST':
          userList.push(...msg.users);
          break;
        case 'JOIN':
          userList.push(msg.user);
          break;
        case 'PART':
        case 'QUIT':
          const ui = userList.indexOf(msg.user);
          if (ui !== -1) {
            userList.splice(ui);
          }
          break;
      }
      userList.sort();
    });
  }

  ngOnInit() {
    this.ircClient.connect();
  }

  onSendMessage(message) {
    const target = this.currentChat;
    console.log(target, message)
    this.ircClient.send(target, message);
    this.chatList[target].messages.push({
      type: 'PRIVMSG',
      sender: '@localuser',
      target,
      message
    });
  }

  show(chatName) {
    this.currentChat = chatName;
    const chat = this.chat(chatName);
    this.messageWindow.bind(chat);
    return chat;
  }

  chat(chatName?: string): ChatData {
    if (chatName == null && this.currentChat) {
      return this.chat(this.currentChat);
    }
    let chat = this.chatList[chatName];
    if (chat == null) {
      chat = this.chatList[chatName] = new ChatData();
      if (chatName) {
        chat.name = chatName;
        this.chatOpen.emit(chatName);
        this.show(chatName);
      }
    }
    return chat;
  }

}

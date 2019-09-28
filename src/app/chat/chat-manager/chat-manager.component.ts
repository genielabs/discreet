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
import {ChatInfo} from '../chat-info';
import {ChatData} from '../chat-data';
import {HttpClient} from '@angular/common/http';

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

  private chatList: ChatData[] = [];
  currentChat: ChatInfo;

  @Output() chatClosed = new EventEmitter<any>();
  @Output() chatOpen = new EventEmitter<any>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private ircClient: IrcClient
  ) {
    this.ircClient.messageReceive.subscribe((msg) => {
      //msg.message = this.createTextLinks_(msg.message);
      console.log(msg.message);
      const ni = msg.sender.indexOf('!');
      if (ni > 0) {
        msg.sender = msg.sender.substring(0, ni);
      }
      if (this.ircClient.config.nick === msg.target) {
        msg.target = msg.sender;
      }
      this.chat(msg.target).receive(msg);
      this.messageWindow.onNewMessage(msg);
    });
    this.ircClient.usersList.subscribe((msg) => {
      console.log('####', this.chat(msg.target));
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
            userList.splice(ui, 1);
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
    this.chat().send(message);
  }

  client() {
    return this.ircClient;
  }

  show(target: string | ChatInfo) {
    const chat = this.chat(target);
    this.currentChat = chat.target();
    chat.stats.messages.new = 0;
    this.messageWindow.bind(chat);
    return chat;
  }

  chat(target?: string | ChatInfo): ChatData {
    if (target == null && this.currentChat) {
      return this.chat(this.currentChat);
    } else if (target == null) {
      return new ChatData('loopback', this);
    }
    let chat = this.chatList.find((c) => c.target() === target || c.target().name === target || c.target().prefix === target);
    if (chat == null) {
      chat = new ChatData(target, this);
      this.chatList.push(chat);
      if (target) {
        this.chatOpen.emit(chat);
        this.show(target);
      }
    }
    return chat;
  }

}

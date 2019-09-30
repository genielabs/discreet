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
import {MatMenu} from '@angular/material';

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
  currentUser: string;

  userMessage = '';

  // state variables
  showUserList = false;
  isLoadingChat = true;

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
      switch (msg.action) {
        case 'LIST':
          this.addChatUser(msg.target, ...msg.users.filter((u) => {
            return u !== '';
          }));
          break;
        case 'JOIN':
          this.addChatUser(msg.target, msg.user);
          break;
        case 'PART':
        case 'QUIT':
          this.delChatUser(msg.target, msg.user);
          break;
      }
    });
  }

  ngOnInit() {
    this.ircClient.connect();
  }

  onSendMessage(message) {
    this.chat().send(message);
  }

  onChannelButtonClick(c) {
    const chat = this.show(c.target());
    this.showUserList = chat.hasUsers();
  }

  onUserClick(menu: MatMenu, user: string) {
    const chars = ['@', '&', '~', '+'];
    while (chars.indexOf(user[0]) !== -1) {
      user = user.substring(1);
    }
    this.currentUser = user;
  }

  onUserMenuChat() {
    const chat = this.show(this.currentUser);
    this.showUserList = chat.hasUsers();
  }

  onAddEmoji(emoji) {
    console.log(emoji);
    this.userMessage += emoji.native + ' ';
  }

  onEnterKey(e) {
    this.messageWindow.sendMessage.emit(this.userMessage);
    this.userMessage = '';
//    this.messageWindow.scrollLast(true);
  }

  showChatList() {
    this.showUserList = false;
  }
  showChatUsers() {
    this.showUserList = true;
  }

  newMessageCount() {
    let newMessages = 0;
    this.chatList.forEach((c) => {
      newMessages += c.stats.messages.new;
    });
    return newMessages;
  }

  client() {
    return this.ircClient;
  }

  show(target: string | ChatInfo) {
    this.isLoadingChat = true;
    const chat = this.chat(target);
    setTimeout(() => {
      this.currentChat = chat.target();
      chat.stats.messages.new = 0;
      this.messageWindow.bind(chat);
      this.isLoadingChat = false;
    });
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
        this.showUserList = true;
        this.chatOpen.emit(chat);
        this.show(target);
      }
    }
    return chat;
  }

  /*

  IRC User Roles
  --------------
  ~ for owners – to get this, you need to be +q in the channel
  & for admins – to get this, you need to be +a in the channel
  @ for full operators – to get this, you need to be +o in the channel
  % for half operators – to get this, you need to be +h in the channel
  + for voiced users – to get this, you need to be +v in the channel

  */

  getColor(c: ChatData | string): string {
    if (c == null) {
      return 'error';
    }
    let prefix = '';
    if (typeof c === 'string') {
      prefix = c;
    } else {
      if (c.hasUsers()) {
        return 'people_alt';
      }
      prefix = c.info.name;
    }
    if (this.isAdministrator(prefix) || this.isOwner(prefix)) {
      return 'accent';
    }
    if (this.isOperator(prefix)) {
      return 'primary';
    }
    if (this.isHalfOperator(prefix)) {
      return 'warn';
    }
    if (this.isVoice(prefix)) {
      return 'record_voice_over';
    }
    return 'person';
  }

  getIcon(c: ChatData | string): string {
    if (c == null) {
      return 'error';
    }
    let prefix = '';
    if (typeof c === 'string') {
      prefix = c;
    } else {
      if (c.hasUsers()) {
        return 'people_alt';
      }
      prefix = c.info.name;
    }
    if (this.isOwner(prefix)) {
      return 'stars';
    }
    if (this.isAdministrator(prefix)) {
      return 'security';
    }
    if (this.isOperator(prefix)) {
      return 'security';
    }
    if (this.isHalfOperator(prefix)) {
      return 'how_to_reg';
    }
    if (this.isVoice(prefix)) {
      return 'record_voice_over';
    }
    return 'person';
  }

  isOwner(name) {
    return name.indexOf('~') >= 0;
  }

  isAdministrator(name) {
    return name.indexOf('&') >= 0;
  }

  isHalfOperator(name) {
    return name.indexOf('%') >= 0;
  }

  isOperator(name) {
    return name.indexOf('@') >= 0;
  }

  isVoice(name) {
    return name.indexOf('+') >= 0;
  }

  removeUserNameFlags(name: string): string {
    return name.replace(/[~&@%+]/g,'');
  }

  getUsersList(target: string) {
    const chat = this.chatList.find((c) => c.target().name === target || c.target().prefix === target);
    return chat && chat.users;
  }

  private addChatUser(target: string, ...users: string[]) {
    this.getUsersList(target).push(...users);
    this.sortUsersList(target);
  }
  private delChatUser(target: string, user: string) {
    if (target == null) {
      this.chatList.forEach((c) => {
        if (c.hasUsers()) {
          const userList = c.users;
          const ui = userList.indexOf(user);
          if (ui !== -1) {
            userList.splice(ui, 1);
          }
        }
      });
    } else {
      const userList = this.getUsersList(target);
      const ui = userList.indexOf(user);
      if (ui !== -1) {
        userList.splice(ui, 1);
      }
    }
  }
  private sortUsersList(target: string) {
    this.getUsersList(target).sort((a, b) => {
      if (this.getUsersSortValue(a) < this.getUsersSortValue(b)) {
        return -1;
      }
      if (this.getUsersSortValue(a) > this.getUsersSortValue(b)) {
        return 1;
      }
      return 0;
    });
  }
  private getUsersSortValue(user: string) {
    if (this.isOwner(user)) {
      user = user.replace('~', '0:');
    } else if (this.isAdministrator(user)) {
      user = user.replace('&', '1:');
    } else if (this.isOperator(user)) {
      user = user.replace('@', '2:');
    } else if (this.isHalfOperator(user)) {
      user = user.replace('%', '3:');
    } else if (this.isVoice(user)) {
      user = user.replace('+', '4:');
    } else {
      user = '5:' + user;
    }
    user = this.removeUserNameFlags(user);
    return user;
  }

}

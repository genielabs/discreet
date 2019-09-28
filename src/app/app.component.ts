import {Component, Input, ViewChild} from '@angular/core';
import {MatMenu} from '@angular/material';
import {ChatManagerComponent} from './chat/chat-manager/chat-manager.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  chatList: string[] = [];
  title = 'ng-web-irc';
  currentUser: string;
  @ViewChild('chatManager', {static: true}) chatManager: ChatManagerComponent;

  // state variables
  showUserList = false;

  onChatOpen(chatName) {
    const chat = this.chatManager.show(chatName);
    this.showUserList = true;
    this.chatList.push(chatName);
  }

  onChannelButtonClick(sidenav, c) {
    if (sidenav.mode !== 'side') {
      sidenav.close();
    }
    const chat = this.chatManager.show(c);
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
    const chat = this.chatManager.show(this.currentUser);
    this.showUserList = chat.hasUsers();
  }

  showChatList() {
    this.showUserList = false;
  }

  toggleToolBar(t) {
    console.log(t);
  }
}

import {Component, HostListener, OnInit} from '@angular/core';

import {ChatManagerComponent} from './chat/chat-manager/chat-manager.component';
import {LoginInfo} from './irc-client/login-info';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ng-web-irc';
  isUserLogged = false;
  loginInfo = new LoginInfo();

  screenWidth: number;
  screenHeight: number;
  sideOverBreakPoint = 768;

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  onConnectRequest(credentials: LoginInfo) {
    this.loginInfo = credentials;
    this.isUserLogged = true;
  }
  onChannelButtonClick(chatManager: ChatManagerComponent) {
    chatManager.show(chatManager.channel().info.name);
    chatManager.showChatUsers();
  }
  onDisconnectClick() {
    window.document.location.reload();
  }
}

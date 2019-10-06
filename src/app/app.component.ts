import {Component, Input, ViewChild} from '@angular/core';

import {MatMenu} from '@angular/material';

import {ChatManagerComponent} from './chat/chat-manager/chat-manager.component';
import {ChatData} from './chat/chat-data';
import {EnrichMessage} from './chat/pipes/enrich-message.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-web-irc';
  isUserLogged = false;
  nick: string;

  onConnectRequest(nick) {
    this.nick = nick;
    this.isUserLogged = true;
  }
  onChannelButtonClick(chatManager: ChatManagerComponent) {
    chatManager.show(chatManager.channel().info.name);
    chatManager.showChatUsers();
  }
  // TODO: ...
}

import {Component, HostListener, OnInit, ViewChild} from '@angular/core';

import {ChatManagerComponent} from './chat/chat-manager/chat-manager.component';
import {LoginInfo} from './irc-client/login-info';
import {MatDialog, MatSidenav, MatSidenavContainer} from '@angular/material';
import {ActionPromptComponent} from './chat/dialogs/action-prompt/action-prompt.component';
import {AwayPromptComponent} from './chat/dialogs/away-prompt/away-prompt.component';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav', {static: false}) public sidenav: MatSidenav;

  title = 'ng-web-irc';
  isUserLogged = false;
  isUserAway = false;
  loginInfo = new LoginInfo();
  isLoadingChat = false;

  screenWidth: number;
  screenHeight: number;
  sideOverBreakPoint = 768;

  constructor(
    public dialog: MatDialog,
    public deviceService: DeviceDetectorService
  ) {}

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

  onUserActionClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    const dialogRef = this.dialog.open(ActionPromptComponent, {
      width: '330px',
      data: chatManager.client().config.nick
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.length > 0) {
        chatManager.userAction(res);
      }
    });
  }
  onSetAwayClick(e, chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    if (this.isUserAway) {
      chatManager.setAway('');
      e.source.checked = this.isUserAway = false;
    } else {
      const dialogRef = this.dialog.open(AwayPromptComponent, {
        width: '330px'
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res !== chatManager.awayMessage) {
          chatManager.setAway(res);
          this.isUserAway = (chatManager.awayMessage.length > 0);
        }
        e.source.checked = this.isUserAway;
      });
    }
  }
  onNickChangeClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    const dialogRef = this.dialog.open(ActionPromptComponent, {
      data: {
        title: 'Cambia nick',
        description: 'Inserisci il nuovo nome da utilizzare',
        pattern: '^[A-Za-z_\-\[\]\\^{}|`][A-Za-z0-9_\-\[\]\\^{}|`]{2,15}$',
        value: chatManager.client().config.nick,
        confirm: 'Cambia',
        cancel: 'Annulla'
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      console.log(res);
    });
  }
  onShowJoinPartsChange(e, chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    chatManager.channel().preferences.showChannelActivityToggle();
  }
  onDisconnectClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    chatManager.disconnect();
    //window.document.location.reload();
  }
  onConnectClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    chatManager.connect();
  }
  onChatLoading(loading) {
    console.log('LOADING', loading);
    this.isLoadingChat = loading;
  }
}

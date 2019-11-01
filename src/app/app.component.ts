import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {ChatManagerComponent} from './chat/chat-manager/chat-manager.component';
import {LoginInfo} from './irc-client-service/login-info';
import {MatDialog, MatSidenav} from '@angular/material';
import {ActionPromptComponent} from './chat/dialogs/action-prompt/action-prompt.component';
import {AwayPromptComponent} from './chat/dialogs/away-prompt/away-prompt.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {NicknamePromptComponent} from './chat/dialogs/nickname-prompt/nickname-prompt.component';
import {MediaPlaylistComponent} from './chat/dialogs/media-playlist/media-playlist.component';
import {ChatUser} from './chat/chat-user';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {IrcClientService} from './irc-client-service/irc-client-service';
import {ChannelsListComponent} from './chat/dialogs/channels-list/channels-list.component';
import {PrivateChat} from './chat/private-chat';
import {PouchDBService} from './services/pouchdb.service';

import { ThemeService } from './core/services/theme.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav', {static: false})
  public sidenav: MatSidenav;
  @ViewChild('chatManager', {read: ChatManagerComponent, static: false})
  private channelManager: ChatManagerComponent;

  settings = {
    isDarkTheme: false
  };

  title = 'ng-web-irc';
  isUserLogged = false;
  isUserAway = false;
  isLoadingChat = false;

  screenWidth: number;
  screenHeight: number;
  sideOverBreakPoint = 768;

  mediaPlaylistCount = 0;
  mediaPlaylistNotify = false;

  private mediaCountInterval = setInterval(() => {
    const channelManager = this.channelManager;
    if (channelManager && channelManager.currentChat) {
        if (channelManager.isPublicChat(channelManager.currentChat.info)) {
          const count = channelManager
            .channel().users
            .reduce((a: number, b: ChatUser) => a + b.playlist.length, 0);
          if (count > this.mediaPlaylistCount) {
            this.mediaPlaylistNotify = true;
          }
          this.mediaPlaylistCount = count;
        } else {
          const count = (channelManager.currentChat as PrivateChat).user.playlist.length;
          if (count > this.mediaPlaylistCount) {
            this.mediaPlaylistNotify = true;
          }
          this.mediaPlaylistCount = count;
        }
      } else {
        this.mediaPlaylistCount = 0;
      }
  }, 2000);

  private updateDbTimeout;

  constructor(
    public dialog: MatDialog,
    public deviceService: DeviceDetectorService,
    public ircClientService: IrcClientService,
    private router: Router,
    private route: ActivatedRoute,
    private locationService: Location,
    private pouchDbService: PouchDBService,
    private themeService: ThemeService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.themeService.isDarkTheme.subscribe((isDark) => this.settings.isDarkTheme = isDark );
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    this.loadConfiguration();
  }
  ngOnDestroy() {
    if (this.mediaCountInterval) {
      clearInterval(this.mediaCountInterval);
    }
  }

  onConnectRequest(credentials: LoginInfo) {
    this.ircClientService.setCredentials(credentials);
    this.pouchDbService.put('client.config', this.ircClientService.config);
    this.isUserLogged = true;
  }
  onChannelUsersButtonClick(chatManager: ChatManagerComponent) {
    chatManager.showChatUsers();
  }
  onChatMessagesButtonClick(chatManager: ChatManagerComponent) {
    chatManager.showChatList();
  }
  onChannelPlaylistButtonClick(chatManager: ChatManagerComponent) {
    if (this.screenWidth < 640) {
      this.channelManager.closeRightPanel();
    }
    this.mediaPlaylistNotify = false;
    this.router.navigate(['.'], { fragment: 'playlist', relativeTo: this.route });
    const dialogRef = this.dialog.open(MediaPlaylistComponent, {
      width: '330px',
      data: chatManager.isPublicChat(chatManager.currentChat.info)
              ? chatManager.channel().users
              : [(chatManager.currentChat as  PrivateChat).user],
      closeOnNavigation: true
    });
    dialogRef.afterClosed().subscribe(media => {
      if (this.router.url.indexOf('#playlist') > 0) {
        this.locationService.back();
      }
      if (media) {
        let videoId = '';
        if (media.url.indexOf('v=') === -1) {
          videoId = media.url.substring(media.url.lastIndexOf('/') + 1);
        } else {
          videoId = media.url.split('v=')[1];
          const ampersandPosition = videoId.indexOf('&');
          if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
          }
        }
        this.channelManager.videoPlayer.loadVideo(videoId);
      }
    });
  }

  onUserActionClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    this.router.navigate(['.'], { fragment: 'action', relativeTo: this.route });
    const dialogRef = this.dialog.open(ActionPromptComponent, {
      width: '330px',
      data: chatManager.client().config.nick,
      closeOnNavigation: true
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
      this.router.navigate(['.'], { relativeTo: this.route, replaceUrl: true });
      chatManager.setAway('');
      e.source.checked = this.isUserAway = false;
    } else {
      this.router.navigate(['.'], { fragment: 'action', relativeTo: this.route });
      const dialogRef = this.dialog.open(AwayPromptComponent, {
        width: '330px',
        closeOnNavigation: true
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
    this.router.navigate(['.'], { fragment: 'action', relativeTo: this.route });
    const dialogRef = this.dialog.open(NicknamePromptComponent,{
      data: {
        nick: chatManager.client().config.nick,
        password: chatManager.client().config.password
      },
      closeOnNavigation: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        chatManager.client().nick(res.nick);
        if (res.password && res.password.length > 0) {
          chatManager.client().config.password = res.password;
          chatManager.client().identify();
        }
      }
    });
  }
  onChannelListClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    this.router.navigate(['.'], { fragment: 'channels', relativeTo: this.route });
    const dialogRef = this.dialog.open(ChannelsListComponent, {
      width: '330px',
      closeOnNavigation: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.length > 0) {
        this.ircClientService.join(res);
        chatManager.show(res);
      }
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
  }
  onConnectClick(chatManager: ChatManagerComponent) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    chatManager.connect();
  }
  onChatLoading(loading) {
    this.isLoadingChat = loading;
  }
  onToggleDarkTheme(checked: boolean) {
    if (this.deviceService.isMobile()) {
      this.sidenav.close();
    }
    this.themeService.setDarkTheme(checked);
    this.saveConfiguration();
  }

  public loadConfiguration() {
    this.pouchDbService.get('settings').then(settings => {
      this.settings = settings;
    }).catch(err => {
      console.log('Error loading settings.', err);
    });
  }
  public saveConfiguration() {
    if (this.updateDbTimeout) {
      if (this.updateDbTimeout !== true) {
        clearTimeout(this.updateDbTimeout);
      }
      this.updateDbTimeout = setTimeout(this.saveConfiguration.bind(this), 500);
      return;
    }
    this.updateDbTimeout = true;
    // update db
    this.pouchDbService.put('settings', this.settings).then((res) => {
      this.updateDbTimeout = false;
    }).catch(err => {
      this.updateDbTimeout = false;
    });
  }

}

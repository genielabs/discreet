import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  HostListener,
  Injectable,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import {MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material/snack-bar';

import {IrcClientService} from '../../irc-client-service/irc-client-service';
import {MessagesWindowComponent} from '../messages-window/messages-window.component';
import {ChatInfo} from '../chat-info';
import {ChatData} from '../chat-data';
import {MatDialog, MatMenu} from '@angular/material';
import {ChatUser} from '../chat-user';
import {YoutubeVideoComponent} from '../../socialmedia/youtube-video/youtube-video.component';
import {EmojiDialogComponent} from '../dialogs/emoji-dialog/emoji-dialog.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MediaPlaylistComponent} from '../dialogs/media-playlist/media-playlist.component';
import {ChatMessage, ChatMessageType} from '../chat-message';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {ActivatedRoute, Router} from '@angular/router';
import {PublicChat} from '../public-chat';
import {PrivateChat} from '../private-chat';
import {ChannelsListComponent} from '../dialogs/channels-list/channels-list.component';
import {IrcUser} from '../../irc-client-service/irc-user';
import {UserInfoDialogComponent} from '../dialogs/user-info-dialog/user-info-dialog.component';
import {SettingsService} from '../../services/settings.service';
import {YoutubeSearchComponent} from '../dialogs/youtube-search/youtube-search.component';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  styleUrls: ['./chat-manager.component.scss']
})
export class ChatManagerComponent implements OnInit {
  @ViewChild(MessagesWindowComponent, {static: true})
  private messageWindow: MessagesWindowComponent;
  @ViewChild('userMenu', {static: true})
  userMenu: MatMenu;
  @ViewChild(YoutubeVideoComponent, {static: true})
  videoPlayer: YoutubeVideoComponent;
  @ViewChild('messageInput', {static: false})
  messageInput: ElementRef;
  @ViewChild('userListScrollView', {static: false})
  userListScrollView: CdkVirtualScrollViewport;

  tributeOptions = {
    values: [ ],
    positionMenu: false,
    selectTemplate(item) {
      return item.original.value;
    }
  };

  private chatList = {
    public: [] as PublicChat[],
    private: [] as PrivateChat[],
    isPublic(target: string | ChatInfo | PublicChat | PrivateChat): boolean {
      return (target instanceof PublicChat)
        || (target instanceof ChatInfo && target.type === 'public')
        || (typeof target === 'string' && target.startsWith('#'));
    },
    find(target: string | ChatInfo): PublicChat | PrivateChat {
      if (this.isPublic(target)) {
        return this.public.find((c) => c.target() === target
          || c.target().name.toLowerCase() === target.toString().toLowerCase()
          || c.target().prefix.toLowerCase() === target.toString().toLowerCase());
      } else {
        return this.private.find((c) => c.target() === target
          || c.target().name.toLowerCase() === target.toString().toLowerCase()
          || c.target().prefix.toLowerCase() === target.toString().toLowerCase());
      }
    },
    add(target: string | ChatInfo, chatManager: ChatManagerComponent): PublicChat | PrivateChat {
      let chat: PublicChat | PrivateChat = null;
      if (this.isPublic(target)) {
        chat = new PublicChat(target, chatManager);
        this.public.push(chat);
      } else {
        chat = new PrivateChat(target, chatManager);
        this.private.push(chat);
      }
      chat.chatEvent.subscribe((e) => {
        if (e.event === 'playlist:add' && chat.manager().followingUserPlaylist === e.user) {
          chat.manager().videoPlayer.loadVideo(e.media.url);
        }
      });
      return chat;
    }
  };
  boundChatList = new BoundChatList();

  currentChat: PrivateChat | PublicChat;
  currentUser: ChatUser;
  currentMenuChat: PrivateChat | any;

  awayMessage = '';

  userSearchMode = false;
  userSearchValue = '';

  // state variables
  showRightPanel = true;
  showUserList = false;
  isLoggedIn = false;
  followingUserPlaylist: ChatUser;

  screenHeight = window.innerHeight;
  screenWidth = window.innerWidth;

  @Output() chatClosed = new EventEmitter<any>();
  @Output() chatOpen = new EventEmitter<any>();
  @Output() chatLoading = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if (this.screenWidth !== window.innerWidth) {
      if (this.screenWidth < 640) {
        this.closeRightPanel();
      } else {
        this.openRightPanel();
      }
    }
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  constructor(
    private snackBar: MatSnackBar,
    private componentFactoryResolver: ComponentFactoryResolver,
    public ircClient: IrcClientService,
    public dialog: MatDialog,
    public deviceService: DeviceDetectorService,
    public settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // listen to IRC events
    this.ircClient.connectionStatus.subscribe((connected) => {
      // TODO:
    });
    this.ircClient.loggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.chatLoading.emit(false);
      }
    });
    this.ircClient.messageReceive.subscribe((msg: ChatMessage) => {
      const ni = msg.sender.indexOf('!'); // <-- TODO: not sure if this check is still needed
      if (ni > 0) {
        msg.sender = msg.sender.substring(0, ni);
      }
      // the message is for the local chatUser
      if (this.ircClient.nick() === msg.target) {
        msg.target = msg.sender;
      }
      // set type to MESSAGE (TODO: add support for NOTICE and MOTD TEXT '372')
      msg.type = ChatMessageType.MESSAGE;
      const chat = this.chat(msg.target);
      chat.receive(msg);
      // Show notification popup if message is not coming from the currently opened chat
      if (!chat.preferences.disableNotifications && chat !== this.currentChat && !(chat instanceof PublicChat)) {
        this.notify(msg.sender, msg.message, msg.sender);
      }
    });
    this.ircClient.userJoin.subscribe(({channel, user, msg}) => {
      this.addChatUser(channel, user);
      if (msg.action !== 'LIST') {
        this.addServiceEvent(
          channel, user.name,
          ChatMessageType.JOIN,
          'joined',
          {description: msg.message}
        );
      }
    });
    this.ircClient.userKick.subscribe(({channel, user, msg}) => {
      if (this.ircClient.nick() === user.name) {
        (this.chat(channel) as PublicChat).userStatus.kicked = true;
      }
      this.delChatUser(channel, user);
      this.addServiceEvent(
        channel, user.name,
        ChatMessageType.KICK,
        'has been kicked',
        {description: msg.message}
      );
    });
    this.ircClient.inviteOnly.subscribe((msg) => {
      const chat = (this.show(msg.channel) as PublicChat);
      chat.userStatus.invite = true;
    });
    this.ircClient.registeredOnly.subscribe((msg) => {
      const chat = (this.show(msg.channel) as PublicChat);
      chat.userStatus.registered = true;
    });
    this.ircClient.userBanned.subscribe((msg) => {
      const chat = (this.show(msg.channel) as PublicChat);
      chat.userStatus.banned = true;
    });
    this.ircClient.userPart.subscribe(({channel, user, msg}) => {
      this.delChatUser(channel, user);
      this.addServiceEvent(
        channel, user.name,
        ChatMessageType.PART,
        'left',
        {description: msg.message}
      );
    });
    this.ircClient.userQuit.subscribe(({user, msg}) => {
      this.delChatUser(null, user, (channel) => {
        this.addServiceEvent(
          channel, user.name,
          ChatMessageType.QUIT,
          'disconnected',
          {description: msg.message}
        );
      });
    });
    this.ircClient.userNick.subscribe(({oldNick, u, msg}) => {
      this.renChatUser((u as IrcUser).name);
      const chat = this.chatList.find(oldNick);
      if (chat instanceof PrivateChat) {
        chat.info.name = (u as IrcUser).name;
      }
      // TODO: addServiceEvent!!!
    });
    this.ircClient.channelJoin.subscribe((channel) => {
      const chat = (this.show(channel) as PublicChat);
      // reset channel users list and other flags
      chat.reset();
      // local user join event
      this.addServiceEvent(
        channel, this.ircClient.nick(),
        ChatMessageType.JOIN,
        'joined',
        {description: ''}
      );
    });
    this.ircClient.channelTopic.subscribe(({channel, topic}) => {
      const chat = (this.show(channel) as PublicChat);
      // set the topic
      chat.topic = topic;
      const msg = new ChatMessage();
      msg.sender = '<strong>TOPIC</strong>'; // TODO: add i18n support
      msg.target = chat.info.name;
      msg.type = ChatMessageType.MESSAGE;
      msg.message = `<strong>${topic}</strong>`;
      chat.receive(msg);
    });
    this.ircClient.userMode.subscribe((m) => {
      // TODO: ......................
      console.log('SERVER MODE', m.user, m.mode);
    });
    this.ircClient.chanMode.subscribe((m) => {
      // TODO: ...
      console.log('CHAN MODE', m.user, m.mode);
    });
    this.ircClient.userChannelMode.subscribe((m) => {
      const chat = this.chatList.find(m.channel) as PublicChat;
      const user = chat.getUser(m.user.name);
      user.icon = this.getIcon(user.flags);
      user.color = this.getColor(user.flags);
      chat.users.splice(chat.users.indexOf(user), 1);
      this.insertionSortUser(chat.users, user);
      chat.users = chat.users.slice();
      this.addServiceEvent(
        m.channel,
        m.sender,
        ChatMessageType.MODE,
        `set MODE ${m.mode} ${m.user.name}`,
        {description: ''}
      );
    });
    this.ircClient.awayReply.subscribe((msg) => {
      msg.type = ChatMessageType.MESSAGE;
      this.chat(msg.sender).receive(msg);
      const channel = this.channel();
      if (channel) {
        const user = channel.getUser(msg.sender);
        if (user) {
          user.away = msg.message;
        }
      }
    });
  }

  private addServiceEvent(channel: string, sender: string, eventType: ChatMessageType, eventDescription: string, data: any) {
    if (this.currentChat && channel === this.currentChat.info.name) {
      const eventMessage = new ChatMessage();
      eventMessage.type = eventType;
      eventMessage.message = eventDescription;
      eventMessage.data = data;
      eventMessage.sender = sender;
      eventMessage.target = channel;
      this.currentChat.serviceMessage = eventMessage;
    }
  }

  ngOnInit() {
    this.messageWindow.mediaUrlClick.subscribe((mediaUrl) => {
      if (mediaUrl.id) {
        // YouTube link is opened with built-in player
        this.videoPlayer.loadVideo(mediaUrl.id);
      } else {
        // Other links are opened in a new window
        window.open(mediaUrl.link, '_blank');
      }
    });
    // work-around for ngCheckExpressioneChanged...
    setTimeout(this.connect.bind(this), 100);
  }

  onChatMenuButtonClick(c: PrivateChat | PublicChat) {
    this.currentMenuChat = c;
  }
  onChatButtonClick(c: ChatData) {
    const chat = this.show(c.target());
  }
  onCloseChatClick(c: PrivateChat | PublicChat) {
    this.closeChat(c);
  }

  onUserClick(menu: MatMenu, user: ChatUser) {
    this.currentUser = user;
  }

  onUserMenuReply() {
    this.insertTextInput(this.currentUser.name + ', ');
    this.focusTextInput();
  }
  onUserMenuChat() {
    this.showUserList = false;
    this.show(this.currentUser.name);
  }
  onToggleNotificationClick(chat: PrivateChat | PublicChat) {
    chat.preferences.disableNotifications = !chat.preferences.disableNotifications;
    // reset message count when toggling notifications
    chat.stats.messages.new = 0;
  }
  onJoinChannelClick(chat: any) {
    chat.reset();
    this.ircClient.join(chat.info.name);
  }
  onLeaveChannelClick(chat: PrivateChat | PublicChat) {
    // TODO: should ask for confirmation
    this.ircClient.part(chat.info.name);
    this.closeChat(chat);
    this.currentChat = null;
    this.showUserList = false;
  }
  onUserPlaylistClick(user: ChatUser) {
    if (this.screenWidth < 640) {
      this.closeRightPanel();
    }
    this.router.navigate(['.'], { fragment: 'playlist', relativeTo: this.route });
    const dialogRef = this.dialog.open(MediaPlaylistComponent, {
      width: '330px',
      data: [ user ],
      closeOnNavigation: true
    });
    dialogRef.componentInstance.followingUser = this.followingUserPlaylist;
    dialogRef.componentInstance.following.subscribe((u) => {
      this.followingUserPlaylist = u;
    });
    dialogRef.afterClosed().subscribe(media => {
      if (media) {
        this.videoPlayer.loadVideo(media.url);
      }
    });
  }
  onUserInfoClick(u: ChatUser | PrivateChat | PublicChat) {
    let user;
    if (u instanceof ChatUser) {
      user = (u as ChatUser);
    } else if (u instanceof PrivateChat) {
      user = (u as PrivateChat).user;
    } else if (u instanceof PublicChat) {
      // TODO: not implemented yet
      return;
    }
    this.router.navigate(['.'], { fragment: 'info', relativeTo: this.route });
    const dialogRef = this.dialog.open(UserInfoDialogComponent, {
      closeOnNavigation: true,
      data: user
    });
    dialogRef.afterClosed().subscribe(res => {
      // TODO: implement 'chat' button
    });
  }

  onEnterKey(e) {
    if (e) {
      e.preventDefault();
    }
    // TODO: make a method 'sendMessage' out of this
    const textLines = this.currentChat.input.text.split('\n');
    textLines.forEach((params) => {
      // strip unwanted characters codes from string
//      message = message.replace(/[\x00-\x1F\x7F]/g, '');
      if (params.trim() !== '') {
        let spaceIndex = params.indexOf(' ');
        if (params[0] === '/' && spaceIndex > 0) {
          const command = params.substring(1, spaceIndex).toUpperCase();
          let target = params = params.substring(spaceIndex + 1);
          if (command === 'ME') {
            this.userAction(params);
          } else {
            spaceIndex = params.indexOf(' ');
            if (spaceIndex > 0) {
              target = params.substring(0, spaceIndex);
              params = params.substring(spaceIndex + 1);
            }
            switch (command) {
              case 'NICK':
                this.ircClient.nick(target);
                break;
              case 'WHOIS':
                this.ircClient.whois(target);
                break;
              case 'WHOWAS':
                this.ircClient.whowas(target);
                break;
              case 'CTCP':
                this.ircClient.ctcp(target, params);
                break;
              case 'JOIN':
                this.ircClient.join(target);
                break;
              case 'PART':
                this.ircClient.part(target);
                break;
              case 'LIST':
                this.ircClient.list();
                break;
              case 'TOPIC':
                this.ircClient.topic(target, params);
                break;
              case 'MODE':
                this.ircClient.mode(target, params);
                break;
              case 'KICK':
                this.ircClient.kick(target, params);
                break;
              case 'INVITE':
                this.ircClient.invite(target, params);
                break;
              case 'QUERY':
              case 'MSG':
                this.chat(target).send(params);
                break;
            }
          }
        } else {
          this.chat().send(params);
        }
      }
    });
    this.currentChat.input.text = '';
    this.scrollToLast(true);
  }

  onYouTubeSearch(e) {
    this.router.navigate(['.'], { fragment: 'youtube', relativeTo: this.route });
    const dialogRef = this.dialog.open(YoutubeSearchComponent, {
      width: '330px',
      closeOnNavigation: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'share') {
          this.insertTextInput(`https://youtu.be/${result.media.id} `);
          this.onEnterKey(e);
          this.messageInput.nativeElement.focus();
        } else {
          this.videoPlayer.loadVideo(result.media.id);
        }
      }
    });
    this.messageInput.nativeElement.blur();
    e.preventDefault();
  }
  onOpenEmojiClick(e) {
    this.router.navigate(['.'], { fragment: 'emoji', relativeTo: this.route });
    const dialogRef = this.dialog.open(EmojiDialogComponent, {
      panelClass: 'emoji-dialog-container',
      closeOnNavigation: true
    });
    dialogRef.componentInstance.emojiClicked.subscribe((emoji) => {
      this.insertTextInput(emoji.native);
    });
    dialogRef.afterClosed().subscribe((sendMessage) => {
      this.messageInput.nativeElement.focus();
      if (sendMessage) {
        this.onEnterKey(null);
      }
    });
    e.preventDefault();
  }

  onTextInputBlur(e) {
    // save text input of currently open chat before switching to the new one
    if (this.currentChat) {
      const input = this.messageInput.nativeElement as HTMLInputElement;
      this.currentChat.input.text = input.value;
      this.currentChat.input.selectionStart = input.selectionStart;
      this.currentChat.input.selectionEnd = input.selectionEnd;
    }
  }
  onTextInputFocus(e) {
    const input = this.messageInput.nativeElement as HTMLInputElement;
    setTimeout(() => {
      input.selectionStart = this.currentChat.input.selectionStart;
      input.selectionEnd = this.currentChat.input.selectionEnd;
    }, 50);
  }
  onTextInputKeyDown(e) {
    if (e.key.toString() === '@') {
      // build list of names for zurb tribute
      if (this.channel()) {
        this.tributeOptions.values.length = 0;
        this.channel().users.map((u) => {
          this.tributeOptions.values.push({
            key: u.name,
            value: u.name
          });
        });
      }
    }
  }

  onUserSearchChange() {
    const user = this.userSearchValue.toLowerCase();
    const firstMatch = this.channel().users.find((u) => {
      return u.name.toLowerCase().startsWith(user);
    });
    if (firstMatch) {
      const firstMatchIndex = this.channel().users.indexOf(firstMatch);
      this.userListScrollView.scrollToIndex(firstMatchIndex);
    }
  }

  onChannelJoinClick() {
    this.router.navigate(['.'], { fragment: 'channels', relativeTo: this.route });
    const dialogRef = this.dialog.open(ChannelsListComponent, {
      width: '330px',
      closeOnNavigation: true
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res && res.length > 0) {
        this.ircClient.join(res);
        this.show(res);
      }
    });
  }

  focusTextInput() {
    const input = this.messageInput.nativeElement as HTMLInputElement;
    input.focus();
  }
  insertTextInput(text: string) {
    const chatInput = this.currentChat.input;
    const leftPart = chatInput.text.substring(0, chatInput.selectionStart);
    const rightPart = chatInput.text.substring(chatInput.selectionEnd);
    chatInput.text = leftPart + text + rightPart;
    chatInput.selectionEnd = chatInput.selectionStart = chatInput.selectionStart + text.length;
  }

  closeChat(c: PrivateChat | PublicChat) {
    c.hidden = true;
    if (this.currentChat === c) {
      let chat: any = this.chatList.private.find((nc) => !nc.hidden);
      if (chat == null) {
        chat = this.chatList.public.find((nc) => !nc.hidden);
      }
      this.currentChat = chat;
      if (chat) {
        this.show(chat.info);
      }
    }
  }

  showChatList() {
    if (!this.showUserList && this.isRightPanelOpen()) {
      this.closeRightPanel();
    } else {
      this.showUserList = false;
      this.openRightPanel();
    }
  }
  // TODO: 'PrivateChat' should not be a valid argument type here
  //       it's left as a work-around for 'not assignable' error
  //       when used in template.
  showChatUsers(chat?: PublicChat | PrivateChat) {
    if (this.showUserList && this.isRightPanelOpen()) {
      this.closeRightPanel();
    } else {
      this.show(chat ? chat.info : this.channel().info);
      this.showUserList = true;
      this.openRightPanel();
    }
  }

  // hide/show join/part/kick/quit messages
  toggleChannelActivity() {
    const chat = this.channel();
    if (chat) {
      chat.preferences.showChannelActivity = !chat.preferences.showChannelActivity;
    }
  }

  notify(from, message, target) {
    const snackBarRef: MatSnackBarRef<SimpleSnackBar> = this.snackBar.open(`${from}: ${message}`, 'Show', {
      duration: 5000,
      verticalPosition: 'top'
    });
    snackBarRef.onAction().subscribe(() => {
      this.show(target);
    });
    const audio = new Audio('https://raw.githubusercontent.com/genielabs/chat/master/docs/en/assets/audio/notifications.mp3');
    audio.play();
  }

  scrollToLast(force?: boolean) {
    this.messageWindow.scrollLast(force);
  }

  userAction(message: string) {
    // TODO: this.ircClient.action(target, message)
    message = `\x01ACTION ${message}\x01`;
    this.chat().send(message);
  }
  setAway(reason?: string) {
    this.awayMessage = reason;
    this.ircClient.away(reason);
  }

  newMessageCount() {
    let newMessages = 0;
    // new messages from public channels
    this.chatList.public.forEach((c) => {
      if (c !== this.currentChat && !c.hidden) {
        newMessages += c.stats.messages.new;
      }
    });
    // new messages from users
    this.chatList.private.forEach((c) => {
      if (c !== this.currentChat && !c.hidden) {
        newMessages += c.stats.messages.new;
      }
    });
    return newMessages > 99 ? '99+' : newMessages;
  }

  isRightPanelOpen() {
    return this.showRightPanel;
  }
  openRightPanel() {
    this.showRightPanel = true;
    this.videoPlayer.setRightMargin(true);
  }
  closeRightPanel() {
    this.showRightPanel = false;
    this.videoPlayer.setRightMargin(false);
  }

  connect() {
    this.isLoggedIn = false;
    this.chatLoading.emit(true);
    // // reset channels users list
    // this.chatList.public.forEach((c) => {
    //   c.users.length = 0;
    // });
    this.ircClient.connect().subscribe(null, (error) => {
      this.chatLoading.emit(false);
      this.isLoggedIn = false;
      this.snackBar.open('Connection lost.', 'Connect', {
        verticalPosition: 'bottom'
      }).onAction().subscribe(() => {
        this.connect();
      });
    }, () => {
      this.chatLoading.emit(false);
      this.isLoggedIn = false;
      this.snackBar.open('Connection lost.', 'Connect', {
        verticalPosition: 'bottom'
      }).onAction().subscribe(() => {
        this.connect();
      });
    });
  }

  disconnect() {
    this.ircClient.disconnect();
  }

  client() {
    return this.ircClient;
  }

  show(target: string | ChatInfo) {
    this.chatLoading.emit(true);
    const chat = this.currentChat = this.chat(target);
    setTimeout(() => {
      chat.stats.messages.new = 0;
      this.messageWindow.bind(chat);
      if (chat instanceof PrivateChat) {
        this.showUserList = false;
      }
      // restore text input of new open chat
      if (this.messageInput) {
        const input: HTMLInputElement = this.messageInput.nativeElement;
        input.value = chat.input.text;
        if (!this.deviceService.isMobile()) {
          // TODO: focus input text
          input.focus();
        }
      }
      this.chatLoading.emit(false);
    });
    if (chat instanceof PublicChat) {
      this.showUserList = true;
      this.openRightPanel();
    }
    // close right panel on smaller screen when a chat is opened
    if (this.screenWidth < 640) {
      this.closeRightPanel();
    }
    return chat;
  }

  channel(target?: string | ChatInfo): PublicChat {
    if (target == null && this.isPublicChat(this.currentChat)) {
      return (this.currentChat as PublicChat);
    }
    return this.chatList.public.find((c) => {
      return ((target == null && !c.hidden) || (target != null && (
        c.target() === target
        || c.target().name.toLowerCase() === target.toString().toLowerCase()
        || c.target().prefix.toLowerCase() === target.toString().toLowerCase())
      ));
    });
  }
  chat(target?: string | ChatInfo): PublicChat | PrivateChat {
    if (target == null && this.currentChat) {
      // if no argument is provided return the currently open chat
      return this.currentChat;
    } else if (target == null) {
      // default loopback chat
      return new PrivateChat('Discreet', this);
    }
    let chat = this.chatList.find(target);
    if (chat == null) {
      chat = this.chatList.add(target, this);
      if (target) {
        // force *ngFor refresh by re-assigning chatList
        this.boundChatList = new BoundChatList();
        this.boundChatList.public = this.chatList.public;
        this.boundChatList.private = this.chatList.private;
        // automatically open chat if it's a channel
        if (chat instanceof PublicChat) { // TODO: add facility 'chat.isChannel()'
          this.showUserList = true;
          this.chatOpen.emit(chat);
          this.show(target);
        } else if (this.screenWidth <= 640) {
          this.closeRightPanel();
        }
      }
    }
    if (chat !== this.currentChat) {
      chat.hidden = false;
    }
    return chat;
  }

  isPublicChat(target?: string | ChatInfo | PublicChat | PrivateChat) {
    return target && this.chatList.isPublic(target);
  }
  isPrivateChat(target?: string | ChatInfo | PublicChat | PrivateChat) {
    return target && !this.chatList.isPublic(target);
  }

  filterChat(chat: ChatData) {
    return !chat.hidden;
  }

  getColor(c: ChatData | string): string {
    if (c == null) {
      return 'error';
    }
    let prefix = '';
    if (typeof c === 'string') {
      prefix = c;
    } else {
      if (c instanceof PublicChat) {
        return 'primary';
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
    return '';
  }

  getIcon(c: ChatData | string): string {
    if (c == null) {
      return 'error';
    }
    let prefix = '';
    if (typeof c === 'string') {
      prefix = c;
    } else {
      if (c instanceof PublicChat) {
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

  // TODO: move the following methods th IrcUtil

  /*

  IRC User Roles
  --------------
  ~ for owners – to get this, you need to be +q in the channel
  & for admins – to get this, you need to be +a in the channel
  @ for full operators – to get this, you need to be +o in the channel
  % for half operators – to get this, you need to be +h in the channel
  + for voiced users – to get this, you need to be +v in the channel

  */
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
    return name.replace(/[~&@%+]/g, '');
  }

  getUsersList(target: string) {
    const chat = this.chatList.find(target);
    return chat && (chat as PublicChat).users;
  }

  private addChatUser(target: string, u: IrcUser) {
    // TODO: should check chatList.isPublic(target) and throw an exception if not
    const usersList = this.getUsersList(target);
    const user = new ChatUser(target, u);
    user.color = this.getColor(u.prefix);
    user.icon = this.getIcon(u.prefix);
    user.user.online = true;
    if (usersList) {
      this.insertionSortUser(usersList, user);
      // force chatUser list (virtual-scroll) refresh
      const chat = this.chatList.find(target);
      (chat as PublicChat).users = usersList.slice();
    } else {
console.log('ERROR: while adding user, could not retrieve users list for channel', target, u);
    }
  }
  private renChatUser(user: string) {
    this.chatList.public.forEach((c) => {
      const channelUser = c.getUser(user);
      if (channelUser) {
        const usersList = this.getUsersList(c.info.name);
        // remove and re-insert user in order to keep list sorted
        usersList.splice(usersList.indexOf(channelUser), 1);
        this.insertionSortUser(usersList, channelUser);
        // force chatUser list (virtual-scroll) refresh
        c.users = usersList.slice();
      }
    });
  }
  private delChatUser(target: string, user: IrcUser, callback?) {
    if (target == null) {
      this.chatList.public.forEach((c) => {
        const u = c.getUser(user.name);
        if (u) {
          c.users.splice(c.users.indexOf(u), 1);
          // force chatUser list (virtual-scroll) refresh
          c.users = c.users.slice();
          if (callback) {
            callback(c.info.name);
          }
        }
      });
    } else {
      const c = (this.chatList.find(target) as PublicChat);
      const u = c.getUser(user.name);
      c.users.splice(c.users.indexOf(u), 1);
      // force chatUser list (virtual-scroll) refresh
      c.users = c.users.slice();
      if (callback) {
        callback(c.info.name);
      }
    }
  }
  private insertionSortUser(usersList: ChatUser[], user: ChatUser) {
    let insertIndex = 0;
    for (const item of usersList) {
      if (this.getUsersSortValue(item) > this.getUsersSortValue(user)) {
        break;
      }
      insertIndex++;
    }
    usersList.splice(insertIndex, 0, user);
  }
  private getUsersSortValue(u: ChatUser) {
    let user = u.flags + u.name.toLowerCase();
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
//    } else if (chatUser.hasPlaylist()) {
//      chatUser = '5:' + chatUser;
    } else {
      user = '6:' + user;
    }
    user = this.removeUserNameFlags(user);
    return user;
  }

  isLastMessageVisible() {
    return this.messageWindow.isLastMessageVisible;
  }
}

export class BoundChatList {
  public: PublicChat[] = [];
  private: PrivateChat[] = [];
  activePublicChats(): number {
    return this.public.reduce((a, b) => a + (b.hidden ? 0 : 1), 0);
  }
  activePrivateChats(): number {
    return this.private.reduce((a, b) => a + (b.hidden ? 0 : 1), 0);
  }
}

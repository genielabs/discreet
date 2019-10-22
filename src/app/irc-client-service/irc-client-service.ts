import {EventEmitter, Injectable} from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import {Subject} from 'rxjs';

import {LoginInfo} from './login-info';
import {IrcChannel} from './irc-channel';
import {ChatMessageType} from '../chat/chat-message';
import {IrcUser} from './irc-user';

@Injectable({
  providedIn: 'root',
})
export class IrcClientService {
  private ircClientSubject: Subject<any>;

  // events
  loggedIn = new EventEmitter<any>();
  messageReceive = new EventEmitter<any>();
  joinChannel = new EventEmitter<any>();
  chanMode = new EventEmitter<any>();
  userMode = new EventEmitter<any>();
  userNick = new EventEmitter<any>();
  userJoin = new EventEmitter<any>();
  userPart = new EventEmitter<any>();
  userKick = new EventEmitter<any>();
  userQuit = new EventEmitter<any>();
  userAway = new EventEmitter<any>();
  userChannelMode = new EventEmitter<any>();
  connectionStatus = new EventEmitter<boolean>();
  awayReply = new EventEmitter<any>();
  versionReply = new EventEmitter<any>();
  channelsList = new EventEmitter<IrcChannel[]>();

  private channelList: IrcChannel[];
  private userList: IrcUser[] = [];

  // TODO: remove and deprecate the following (testChannelName)
  //       (put join channels in a config.json file along with other options)
  private testChannelName = '#chatover40';

  //  const webIrcInfo = 'http://localhost:8080/webirc/kiwiirc/info?t=1569095871028';
  //  wss://webchat.chattaora.it:7779/webirc/kiwiirc/963/bft5iqad/websocket
  // 'ws://localhost:8080/webirc/kiwiirc/304/0zze4wtr/websocket';
  private webIrcUrl = 'wss://webchat.chattaora.it:7779/webirc/kiwiirc/963/bft5iqad/websocket';
  private joinChannels = [ this.testChannelName ];

  config = {
    nick: 'Wall`e',
    password: '',
    host: 'localhost',
    user: 'mediairc',
    info: 'MediaIRC',
    version: 'MediaIRC 1.0 by Zen46 - https://genielabs.github.io/chat/'
  };

  constructor() { }

  connect(): Subject<any> {
    const subject = this.ircClientSubject = webSocket<any>({
      url: this.webIrcUrl,
      binaryType: 'arraybuffer',
      // just let the message raw, unparsed
      deserializer: (msg) => msg,
      closeObserver: {
        next: (e: CloseEvent) => {
          this.connectionStatus.next(false);
        }
      },
      openObserver: {
        next: (e: Event) => {
          this.connectionStatus.next(true);
          this.loggedIn.emit(false);
        }
      }
    });
    subject.subscribe(
      msg => {
        console.log('>> ' + msg.data)
        // control command codes
        switch (msg.data) {
          // Just connected
          case 'o':
            subject.next([ ':0 CONTROL START' ]);
            subject.next([ ':1' ]);
            break;
          // PING ACK
          case 'h':
            subject.next([ ':1 PING *' ]);
            break;
          case 'a[":1"]':
            subject.next([ ':1 HOST default:6667' ]);
            subject.next([ ':1 ENCODING utf8' ]);
            subject.next([ ':1 CAP LS 302' ]);
            subject.next([ `:1 NICK ${this.config.nick}` ]);
            subject.next([ `:1 USER ${this.config.user} 0 * ${this.config.info}` ]);
            break;
          default:

// TODO: things to implement and handle:
//       - a[":1 control closed err_unknown_host"]

            let payload;
            if (msg.data.toString().startsWith('a[')) {
              payload = JSON.parse(msg.data.toString().substring(1).trim())[0];
              if (payload.startsWith(':1 ')) {
                payload = payload.substring(3);
                payload = this.parse(payload);
              }
            }

            if (payload) {
              let target = payload.params[0];
              let message = payload.params[1];
              // irc message payload
              switch (payload.command) {
                case 'PING':
                  subject.next([ `:1 PONG ${payload.params[0]}` ]);
                  break;
                case 'CAP':
                  if (payload.params[1] === 'LS') {
                    subject.next([ ':1 CAP REQ :account-notify away-notify extended-join multi-prefix message-tags' ]);
                    subject.next([ ':1 CAP END' ]);
                  } else if (payload.params[1] === 'NACK') {
                    // CAP REPLY (NACK)
                    // TODO: ..
                  } else if (payload.params[1] === 'ACK') {
                    // CAP REPLY (ACK)
                    // TODO: ..
                  }
                  break;
                case '396': // DISPLAYED USER NAME+ADDRESS
                  this.config.nick = payload.params[0];
                  this.config.host = payload.params[1];
                  break;
                case '353': // START USERS LIST
                  this.handleChannelUsersList({
                    action: 'LIST',
                    target: payload.params[2],
                    users: payload.params[3].split(' ')
                  });
                  break;
                case '366': // END USERS LIST
                  /*
                  this.usersList.emit({
                    target: payload.params[2],
                    users: []
                  });*/
                  break;
                case '474': // BANNED
                  // payload.params[0]  NICK
                  // payload.params[1]  Channel
                  // payload.params[2]  Reason
                  console.log('\\\\\\\\\\\\\\\\\\\\\\', 'CANNOT JOIN', payload.params[1], payload.params[2]);
                  break;
                case '301': // AUTOMATIC REPLY FROM AWAY USER
                  this.awayReply.emit({
                    type: payload.command, // 301
                    sender: payload.params[1],
                    target: payload.params[0],
                    message: payload.params[2],
                    timestamp: Date.now()
                  });
                  break;
                case '321': // START channel list (reply to LIST)
                  this.channelList = [];
                  break;
                case '322': // ITEM channel list item (reply to LIST)
                  const ch = new IrcChannel();
                  ch.name = payload.params[1];
                  ch.users = payload.params[2];
                  const modesIndex =  payload.params[3].indexOf(' ');
                  ch.modes = payload.params[3].substring(0, modesIndex);
                  ch.topic = payload.params[3].substring(modesIndex + 1);
                  this.channelList.push(ch);
                  break;
                case '323': // END channel list item (reply to LIST)
                  this.channelsList.emit(this.channelList);
                  break;
                case 'KICK':
                  this.handleChannelUsersList({
                    action: payload.command,
                    target: payload.params[0],
                    user: payload.params[1],
                    message: payload.params[2] || payload.params[1]
                  });
                  break;
                case 'JOIN':
                  // check if it's' the local user
                  const userInfo = this.parseUserAddress(payload.prefix);
                  if (userInfo.nick === this.config.nick) {
                    const channel = payload.params[0];
                    this.joinChannel.emit(channel);
                    break;
                  }
                  // otherwise threat this JOIN message as "userList" message
                case 'PART':
                  this.handleChannelUsersList({
                    action: payload.command,
                    target: payload.params[0],
                    user: this.parseUserAddress(payload.prefix).nick,
                    message: payload.params[2] || payload.params[1]
                  });
                  break;
                case 'NICK':
                  const nickData = {
                    action: payload.command,
                    user: this.parseUserAddress(payload.prefix).nick,
                    nick: payload.params[0]
                  };
                  // local user changed the nick, so update config
                  if (nickData.user === this.config.nick) {
                    this.config.nick = nickData.nick;
                  }
                  this.handleChannelUsersList(nickData);
                  break;
                case 'AWAY':
                case 'QUIT':
                  // other users actions
                  if (message !== '*') {
                    this.handleChannelUsersList({
                      action: payload.command,
                      user: this.parseUserAddress(payload.prefix).nick,
                      message: payload.params[1] || payload.params[0]
                    });
                  }
                  break;
                case 'MODE':
                  if (payload.params.length >= 3) {
                    // user modes on channel
                    const channel = payload.params[0];
                    const mode = payload.params[1]; // eg. "+oao", "+b", "-bbv", +"ao"
                    const users = [];
                    let u = 2;
                    while (payload.params[u]) {
                      users.push(payload.params[u]);
                      u++;
                    }
                    this.handleUserChannelMode({
                      channel,
                      mode,
                      users
                    });
                  } else {
                    // channel or local user modes
                    const modeTarget = payload.params[0];
                    const mode = payload.params[1]; // eg. "+iwxz" (channel)
                    if (modeTarget[0] === '#') {
                      this.chanMode.emit({
                        channel: modeTarget,
                        mode
                      });
                    } else {
                      this.userMode.emit({
                        user: modeTarget,
                        mode
                      });
                      // send password for identifying the registered nick with NickServ
                      this.identify();
                    }
                  }
                  break;
                case '376': // MOTD END
                case '422': // MOTD MISSING
                  this.joinChannels.forEach((channel) => subject.next([ `:1 JOIN ${channel}` ]));
                  this.loggedIn.emit(true);
                  break;
                case '433': // Nickname already in use
                  message = payload.params[1] += ': ' + payload.params[2];
                  console.log('NICKNAME ALREADY IN USE', payload);
                case '372': // MOTD TEXT
                case '305': // You are no longer marked as being away
                case '306': // You have been marked as being away
                case 'NOTICE':
                  if (message.startsWith('\x01VERSION ') && message.endsWith('\x01')) {
                    const version = message.slice(message.indexOf(' '), -1);
                    this.versionReply.emit({
                      sender: payload.prefix,
                      version,
                      timestamp: Date.now()
                    });
                    break;
                  }
                case 'PRIVMSG':
                  const c = this.config;
                  if (payload.command === 'PRIVMSG' && message === '\x01VERSION\x01') {
                    const replyTo = this.parseUserAddress(payload.prefix).nick;
                    const versionReply = `:1 :${c.nick}!${c.user}@localhost NOTICE ${replyTo} :\x01VERSION ${c.version}\x01`;
                    subject.next([ versionReply ]);
                    break;
                  } else if (payload.command === 'PRIVMSG' && message.match(/\x01PING(.*?)\x01/) != null) {
                    const replyTo = this.parseUserAddress(payload.prefix).nick;
                    const pingReply = `:1 :${c.nick}!${c.user}@localhost NOTICE ${replyTo} :${message}`;
                    subject.next([ pingReply ]);
                    break;
                  }
                  if (target === '*') {
                    target = this.config.nick;
                  }
                  this.messageReceive.emit({
                    type: payload.command,
                    sender: payload.prefix,
                    target,
                    message,
                    timestamp: Date.now()
                  });
                  break;
                case '311': // WHOIS - user address
                case '307': // WHOIS - is identified for this nick
                case '319': // WHOIS - user channels
                case '312': // WHOIS - irc server address
//                case '301': // WHOIS - user is away
                case '671': // WHOIS - user is using a secure connection
                case '276': // WHOIS - SSL certificate fingerprint
                case '330': // WHOIS - user is logged in as
                case '317': // WHOIS - signon and idle time
                case '318': // WHOIS - end of WHOIS list
                  console.log('WHOIS', payload);
                  message = payload.params.slice(1).join(' ');
                  this.messageReceive.emit({
                    type: payload.command,
                    sender: payload.prefix,
                    target,
                    message,
                    timestamp: Date.now()
                  });
                  break;
              }
            } else {
              console.log('UNABLE TO PARSE MESSAGE: ', msg.data);
            }

        }
      },
      err => {
        console.log(err);
        this.ircClientSubject = null;
      },
      () => {
        console.log('complete');
        this.ircClientSubject = null;
      }
    );
    return subject;
  }

  disconnect() {
    if (this.ircClientSubject) {
      this.raw(`:1 QUIT :See you later!`);
      this.ircClientSubject.unsubscribe();
      this.ircClientSubject.complete();
      this.ircClientSubject = null;
    }
  }

  isConnected() {
    return this.ircClientSubject != null;
  }

  list(filter?: string) {
    if (filter) {
      this.raw(`:1 LIST ${filter}`);
    } else {
      this.raw(`:1 LIST`);
    }
  }
  join(channel: string) {
    this.raw(`:1 JOIN ${channel}`);
  }
  part(channel: string) {
    this.raw(`:1 PART ${channel}`);
  }

  whois(nick: string) {
    this.raw(`:1 WHOIS ${nick}`);
  }

  ctcp(nick: string, command: string) {
    this.send(nick, `\x01${command}\x01`);
  }

  nick(nick?: string) {
    if (nick) {
      this.raw(`:1 NICK ${nick}`);
    }
    return this.config.nick;
  }

  identify() {
    if (this.config.password && this.config.password.length > 0) {
      this.send('NickServ', `IDENTIFY ${this.config.password}`);
    }
  }

  away(reason?: string) {
    let away = 'AWAY';
    if (reason && reason.length > 0) {
      away += ` :${reason}`;
    }
    const c = this.config;
    this.raw(`:1 :${c.nick}!${c.user}@${c.host} ${away}`);
  }

  raw(message: string) {
    if (this.ircClientSubject) {
      this.ircClientSubject.next([ message ]);
    }
  }
  send(target: string, message: string) {
    if (this.ircClientSubject) {
      this.ircClientSubject.next([`:1 PRIVMSG ${target} :${message}`]);
    }
  }

  private parseUserAddress(prefix) {
    const ni = prefix.split('!');
    return {
      nick: ni[0],
      host: ni[1]
    };
  }

  private parse(data) {
    const message = {
      raw: data,
      tags: {},
      prefix: null,
      command: null,
      params: []
    };
    // position and nextspace are used by the parser as a reference.
    let position = 0;
    let nextspace = 0;
    // The first thing we check for is IRCv3.2 message tags.
    // http://ircv3.atheme.org/specification/message-tags-3.2
    if (data.charCodeAt(0) === 64) {
      nextspace = data.indexOf(' ');
      if (nextspace === -1) {
        // Malformed IRC message.
        return null;
      }
      // Tags are split by a semi colon.
      const rawTags = data.slice(1, nextspace).split(';');
      for (let i = 0; i < rawTags.length; i++) {
        // Tags delimited by an equals sign are key=value tags.
        // If there's no equals, we assign the tag a value of true.
        const tag = rawTags[i];
        const pair = tag.split('=');
        message.tags[pair[0]] = pair[1] || true;
      }
      position = nextspace + 1;
    }
    // Skip any trailing whitespace.
    while (data.charCodeAt(position) === 32) {
      position++;
    }
    // Extract the message's prefix if present. Prefixes are prepended
    // with a colon.
    if (data.charCodeAt(position) === 58) {
      nextspace = data.indexOf(' ', position);
      // If there's nothing after the prefix, deem this message to be
      // malformed.
      if (nextspace === -1) {
        // Malformed IRC message.
        return null;
      }
      message.prefix = data.slice(position + 1, nextspace);
      position = nextspace + 1;
      // Skip any trailing whitespace.
      while (data.charCodeAt(position) === 32) {
        position++;
      }
    }
    nextspace = data.indexOf(' ', position);
    // If there's no more whitespace left, extract everything from the
    // current position to the end of the string as the command.
    if (nextspace === -1) {
      if (data.length > position) {
        message.command = data.slice(position);
        return message;
      }
      return null;
    }
    // Else, the command is the current position up to the next space. After
    // that, we expect some parameters.
    message.command = data.slice(position, nextspace);
    position = nextspace + 1;
    // Skip any trailing whitespace.
    while (data.charCodeAt(position) === 32) {
      position++;
    }
    while (position < data.length) {
      nextspace = data.indexOf(' ', position);
      // If the character is a colon, we've got a trailing parameter.
      // At this point, there are no extra params, so we push everything
      // from after the colon to the end of the string, to the params array
      // and break out of the loop.
      if (data.charCodeAt(position) === 58) {
        message.params.push(data.slice(position + 1));
        break;
      }
      // If we still have some whitespace...
      if (nextspace !== -1) {
        // Push whatever's between the current position and the next
        // space to the params array.
        message.params.push(data.slice(position, nextspace));
        position = nextspace + 1;
        // Skip any trailing whitespace and continue looping.
        while (data.charCodeAt(position) === 32) {
          position++;
        }
        continue;
      }
      // If we don't have any more whitespace and the param isn't trailing,
      // push everything remaining to the params array.
      if (nextspace === -1) {
        message.params.push(data.slice(position));
        break;
      }
    }
    return message;
  }

  setCredentials(credentials: LoginInfo) {
    this.config.nick = credentials.nick;
    this.config.password = credentials.password;
  }

  private handleChannelUsersList(msg: any) {
    switch (msg.action) {
      case 'LIST':
        this.addChatUser(msg, msg.target, ...msg.users.filter((u) => {
          return u !== '';
        }));
        break;
      case 'AWAY':
        const user = this.getUser(msg.user);
        if (user) {
          user.away = msg.message;
          this.userAway.emit(user);
        }
        break;
      case 'NICK':
        this.renChatUser(msg, msg.user, msg.nick);
        break;
      case 'JOIN':
        this.addChatUser(msg, msg.target, msg.user);
        break;
      case 'PART':
        this.delChatUser(msg, msg.target, msg.user);
        break;
      case 'KICK':
        this.delChatUser(msg, msg.target, msg.user);
        break;
      case 'QUIT':
        msg.target = null; // delete user from all channels
        this.delChatUser(msg, msg.target, msg.user);
        break;
    }
  }

  removeUserNameFlags(name: string): string {
    return name.replace(/[~&@%+]/g,'');
  }

  private addChatUser(msg, channel: string, ...users: string[]) {
    users.map((u) => {
      let user = this.getUser(u);
      if (!user) {
        user = new IrcUser();
        this.addUser(user);
      }
      user.online = true;
      user.name = this.removeUserNameFlags(u);
      user.prefix = u;
      user.channels[channel] = { flags: this.getUserNameFlags(u) };
      this.userJoin.emit({channel, user, msg});
      return user;
    });
  }
  private renChatUser(msg, user: string, nick: string) {
    const u = this.getUser(user);
    if (u != null) {
      const oldNick = u.name;
      u.name = nick;
      this.userNick.emit({oldNick, u, msg});
    }
  }
  private delChatUser(msg, channel: string, u: string) {
    const user = this.getUser(u);
    user.online = false;
    (channel == null) ? this.userQuit.emit({user, msg})
      : msg.command === 'KICK'  ? this.userKick.emit({channel, user, msg})
                                : this.userPart.emit({channel, user, msg});
  }

  private addUser(user: IrcUser) {
    this.userList.push(user);
  }
  getUser(nick: string): IrcUser {
    return this.userList.find((u) => u.name === nick);
  }

  private getUserNameFlags(user: string): string {
    let flags = '';
    const chars = ['~', '&', '@', '%', '+'];
    while (chars.indexOf(user[0]) !== -1) {
      flags += user[0];
      user = user.substring(1);
    }
    return flags;
  }

  private handleUserChannelMode(m) {
    m.mode = m.mode.split('');
    const mode = m.mode.shift();
    let flag = '';
    m.mode.forEach((userMode, i) => {
      switch (userMode) {
        case 'q':
          flag = '~';
          break;
        case 'a':
          flag = '&';
          break;
        case 'o':
          flag = '@';
          break;
        case 'h':
          flag = '%';
          break;
        case 'v':
          flag = '+';
          break;
      }
      const user = this.getUser(m.users[i]);
      if (user) {
        const userChannel = user.channels[m.channel];
        const oldFlags = userChannel.flags;
        userChannel.flags = userChannel.flags.replace(flag, '');
        if (mode === '+') {
          userChannel.flags += flag;
        }
        this.userChannelMode.emit({channel: m.channel, user, oldFlags});
      }
    });
  }
}

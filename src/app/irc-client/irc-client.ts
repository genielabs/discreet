import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { webSocket } from 'rxjs/webSocket';
import {Subject} from 'rxjs';

import { StringDecoder } from 'string_decoder';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root',
})
export class IrcClient {
  private ircClientSubject: Subject<any>;

  messageReceive = new EventEmitter<any>();
  usersList = new EventEmitter<any>();
  joinChannel = new EventEmitter<any>();
  chanMode = new EventEmitter<any>();
  userMode = new EventEmitter<any>();
  userChannelMode = new EventEmitter<any>();
  connectionStatus = new EventEmitter<boolean>();

  testChannelName = '#chatover40';

  config = {
    nick: 'Wall`e',
    host: 'localhost',
    user: 'Mibbit',
    info: 'https://ng-web-irc.com/',
    version: 'Ng-Web-IRC 1.0 by Zen46 - https://ng-web-irc.com/'
  };

  constructor(
    private httpClient: HttpClient
  ) { }

  connect(): Subject<any> {
    const webIrcUrl = 'wss://webchat.chattaora.it:7779/webirc/kiwiirc/963/bft5iqad/websocket'; // 'ws://localhost:8080/webirc/kiwiirc/304/0zze4wtr/websocket';
//    const webIrcInfo = 'http://localhost:8080/webirc/kiwiirc/info?t=1569095871028';
//wss://webchat.chattaora.it:7779/webirc/kiwiirc/963/bft5iqad/websocket
    const joinChannels = [ this.testChannelName ];

 //   this.httpClient.get(webIrcInfo).subscribe((res) => {
 //     console.log(res);

      const subject = this.ircClientSubject = webSocket<any>({
        url: webIrcUrl,
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
          }
        }      });
      subject.subscribe(
        msg => {
//console.log('>> ' + msg.data)
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
                const target = payload.params[0];

                let message = payload.params[1];
                // // TODO: decoding
                // if (message) {
                //   const decoder = new StringDecoder('utf8');
                //   message = decoder.write(Buffer.from(message.split(''), 'utf8'));
                // }

                // irc message payload
                //console.log('message received: ', payload.command, payload);
                switch (payload.command) {
                  case 'PING':
                    subject.next([ `:1 PONG ${payload.params[0]}` ]);
                    break;
                  case 'CAP':
                    if (payload.params[1] === 'LS') {
                      subject.next([ ':1 CAP REQ :account-notify away-notify extended-join multi-prefix message-tags' ]);
                      subject.next([ ':1 CAP END' ]);
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
                    this.usersList.emit({
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
                    console.log('\\\\\\\\\\\\\\\\\\\\\\', 'CANNOT JOIN', payload.params[1], payload.params[2]);
                    // payload.params[0]  NICK
                    // payload.params[1]  Channel
                    // payload.params[2]  Reasong
                    break;
                  case 'KICK':
                    this.usersList.emit({
                      action: payload.command,
                      target: payload.params[0],
                      user: payload.params[1]
                    });
                    break;
                  case 'JOIN':
                    // check if it's' the local user
                    const userInfo = this.parseUserAddress(payload.prefix);
                    if (userInfo.nick === this.config.nick) {
                      const ch = payload.params[0];
                      this.joinChannel.emit(ch);
                      break;
                    }
                  case 'PART':
                    this.usersList.emit({
                      action: payload.command,
                      target: payload.params[0],
                      user: this.parseUserAddress(payload.prefix).nick
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
                    this.usersList.emit(nickData);
                    break;
                  case 'MODE':
                    if (payload.params.length === 3) {
                      // user modes on channel
                      const channel = payload.params[0];
                      const mode = payload.params[1]; // eg. "+ooo", "+b", "-bb"
                      const users = [];
                      let u = 2;
                      while (payload.params[u]) {
                        users.push(payload.params[u]);
                        u++;
                      }
                      this.userChannelMode.emit({
                        channel,
                        mode,
                        users
                      });
                    } else {
                      // channel or local user modes
                      const modeTarget = payload.params[0];
                      const mode = payload.params[1]; // eg. "+iwxz"
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
                      }
                    }
                    break;
                  case 'AWAY':
                  case 'QUIT':
                    // other users actions
                    if (message !== '*') {
                      this.usersList.emit({
                        action: payload.command,
                        user: this.parseUserAddress(payload.prefix).nick
                      });
                    }
                    break;
                  case '376': // MOTD END
                  case '422': // MOTD MISSING
                    joinChannels.forEach((ch) => subject.next([ `:1 JOIN ${ch}` ]));
                    break;
                  case '372': // MOTD TEXT
                  case 'PRIVMSG':
                    const c = this.config;
                    if (payload.command === 'PRIVMSG' && message === '\u0001VERSION\u0001') {
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
                    this.messageReceive.emit({
                      type: payload.command,
                      sender: payload.prefix,
                      target,
                      message
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
        },
        () => {
          console.log('complete');
        }
      );
      return subject;
  }

  nick(nick) {
    if (nick) {
      this.raw(`:1 NICK ${nick} `);
    }
    return this.config.nick;
  }

  raw(message: string) {
    this.ircClientSubject.next([ message ]);
  }
  send(target: string, message: string) {
    this.ircClientSubject.next([ `:1 PRIVMSG ${target} :${message}` ]);
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
}

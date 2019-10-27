import {IrcServer} from './irc-server';

export class LoginInfo {
  server: IrcServer;
  nick: string;
  password: string;
  autoJoin = [] as string[];
}

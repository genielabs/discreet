import {IrcChannel} from './irc-channel';

export class IrcServer {
  id: string;
  address: string;
  name: string;
  description?: string;
  webSocketUrl: string;
  channels = [] as IrcChannel[];
  timestamp = 0;
  hidden?: boolean;
}

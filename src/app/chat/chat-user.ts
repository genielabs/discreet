import {MediaInfo} from './text-formatting';
import {IrcUser} from '../irc-client-service/irc-user';

export class ChatUser {
  // volatile data that will be lost if chatUser leaves the channel
  color: string;
  icon: string;
  constructor(public channel: string, public user: IrcUser) {
    // persisted data to ircClientService global users list
    if (user) {
      user.channels[channel].playlist = user.channels[channel].playlist || [] as MediaInfo[];
    }
  }
  get online(): boolean {
    return this.user && this.user.online;
  }
  get name(): string {
    return this.user ? this.user.name : '';
  }
  get flags(): string {
    return this.user ? this.user.channels[this.channel].flags : '';
  }
  get playlist(): MediaInfo[] {
    return this.user ? this.user.channels[this.channel].playlist : [];
  }
  hasPlaylist(): boolean {
    return this.playlist.length > 0;
  }
  get away(): string | null {
    return this.user ? this.user.away : '';
  }
  set away(message: string | undefined) {
    if (this.user) {
      this.user.away = message;
    }
  }
}

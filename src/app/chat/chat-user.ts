import {MediaInfo} from './text-formatting';

export class ChatUser {
  name: string;
  flags: string;
  away: string;
  color: string;
  icon: string;
  playlist: MediaInfo[] = [] as MediaInfo[];
  hasPlaylist() {
    return this.playlist.length > 0;
  }
}

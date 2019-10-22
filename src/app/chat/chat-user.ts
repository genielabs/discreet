import {MediaInfo} from './text-formatting';

export class ChatUser {
  name: string;
  flags: string;
  away: string;
  // TODO: move the flags above to "IrcUser" class and make ChatUser extend that
  // channels: --> channels joined by the user each of what will hold the following data
  color: string;
  icon: string;
  playlist: MediaInfo[] = [] as MediaInfo[];
  hasPlaylist() {
    return this.playlist.length > 0;
  }
}

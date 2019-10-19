import {ChatData} from './chat-data';

export class PrivateChat extends ChatData{
  hasPlaylist() {
    return false;
  }
}

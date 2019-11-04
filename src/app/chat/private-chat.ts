import {ChatData} from './chat-data';
import {ChatManagerComponent} from './chat-manager/chat-manager.component';
import {TextFormatting} from './text-formatting';
import {ChatInfo} from './chat-info';
import {ChatUser} from './chat-user';
import {ChatMessage} from './chat-message';

export class PrivateChat extends ChatData{
  private textFormatting = new TextFormatting();
  user: ChatUser;

  constructor(
    chatInfo: string | ChatInfo,
    chatManager: ChatManagerComponent
  ) {
    super(chatInfo, chatManager);
    this.user = new ChatUser('private', chatManager.ircClient.getUser(this.info.name)) ;
  };

  receive(message: ChatMessage) {
    message = super.receive(message);
    this.textFormatting.enrich(message.rendered.message)
      .subscribe((result) => {
        if (result.mediaInfo) {
          const existingItem = this.user.playlist
            .find((item) => item.url === result.mediaInfo.url);
          if (existingItem == null) {
            this.user.playlist.push(result.mediaInfo);
            this.chatEvent.emit({
              event: 'playlist:add',
              user: this.user,
              media: result.mediaInfo
            });
          }
        }
        message.rendered.message = result.enriched;
        message.rendered.musicIcon = this.user.hasPlaylist() ? 'music_video' : '';
      });
    return message;
  }
  getUser(name?: string) {
    return this.user;
  }
}

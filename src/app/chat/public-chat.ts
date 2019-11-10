import {ChatData} from './chat-data';
import {ChatUser} from './chat-user';
import {ChatMessage} from './chat-message';
import {TextFormatting} from './text-formatting';

export class PublicChat extends ChatData {
  private textFormatting = new TextFormatting();

  topic = '';
  mode: string;
  users: ChatUser[] = [] as ChatUser[];
  userStatus = {
    // kicked from channel
    kicked: false,
    // banned from channel
    banned: false,
    // only invited users can join
    invite: false,
    // only registered users can join
    registered: false
  };
  preferences: any = {
    showChannelActivity: true,
    showChannelActivityToggle() {
      this.showChannelActivity = !this.showChannelActivity;
    }
  };

  receive(message: ChatMessage) {
    message = super.receive(message);
    const senderUser = this.getUser(message.sender);
    this.textFormatting.enrich(message.rendered.message)
      .subscribe((result) => {
        if (result.mediaInfo) {
          if (senderUser) {
            const existingItem = senderUser.playlist
              .find((item) => item.url === result.mediaInfo.url);
            if (existingItem == null) {
              senderUser.playlist.push(result.mediaInfo);
              this.chatEvent.emit({
                event: 'playlist:add',
                user: senderUser,
                media: result.mediaInfo
              });
            }
          }
        }
        message.rendered.message = result.enriched;
        if (senderUser) {
          message.rendered.musicIcon = senderUser.hasPlaylist() ? 'music_video' : '';
        }
      });

    message.rendered.flagsIconColor = this.getUserColor(message.sender);
    message.rendered.flagsIconName = this.getUserIcon(message.sender);
    if (message.rendered.flagsIconName === 'person') {
      // do not show standard use icon in message buffer
      message.rendered.flagsIconName = null;
    }
    return message;
  }

  getUser(name: string) {
    return this.users.find((u) => u.name === name);
  }
  getUserIcon(name: string) {
    const u = this.getUser(name);
    return u != null && this.manager().getIcon(u.flags);
  }
  getUserColor(name: string) {
    const u = this.getUser(name);
    return u != null && this.manager().getColor(u.flags);
  }
  reset() {
    this.users.length = 0;
    this.userStatus = {
      kicked: false,
      banned: false,
      invite: false,
      registered: false
    };
  }
}

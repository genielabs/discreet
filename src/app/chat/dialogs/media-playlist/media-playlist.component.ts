import {Component, EventEmitter, Inject} from '@angular/core';
import {ChatUser} from '../../chat-user';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MediaInfo} from '../../pipes/enrich-message.pipe';

@Component({
  selector: 'app-media-playlist',
  templateUrl: './media-playlist.component.html',
  styleUrls: ['./media-playlist.component.scss']
})
export class MediaPlaylistComponent {
  selectedMedia: MediaInfo;
  followingUser: ChatUser;
  following = new EventEmitter<ChatUser>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public users: any,
  ) { }

  filterCallback(user: ChatUser) {
    return (user.playlist.length > 0);
  }

  onFollowUserClick(user) {
    this.followingUser = this.followingUser === user ? null : user;
    this.following.emit(this.followingUser);
  }
}

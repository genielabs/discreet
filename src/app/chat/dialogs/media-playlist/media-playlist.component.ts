import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {MediaInfo} from '../../text-formatting';
import {ChatUser} from '../../chat-user';

@Component({
  selector: 'app-media-playlist',
  templateUrl: './media-playlist.component.html',
  styleUrls: ['./media-playlist.component.scss']
})
export class MediaPlaylistComponent {
  selectedMedia: MediaInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public users: any
  ) {}

  filterCallback(user: ChatUser) {
    return (user.playlist.length > 0);
  }
}

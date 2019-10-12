import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {MediaInfo} from '../../text-formatting';

@Component({
  selector: 'app-media-playlist',
  templateUrl: './media-playlist.component.html',
  styleUrls: ['./media-playlist.component.scss']
})
export class MediaPlaylistComponent implements OnInit {
  selectedMedia: MediaInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public user: any
  ) { }

  ngOnInit() {
    // will log the entire data object
    console.log('DATA', this.user);
  }
}

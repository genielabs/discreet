import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-emoji-dialog',
  templateUrl: './emoji-dialog.component.html',
  styleUrls: ['./emoji-dialog.component.scss']
})
export class EmojiDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EmojiDialogComponent>) { }

  ngOnInit() {
  }

  onAddEmoji(emoji) {
    console.log(emoji);
    this.dialogRef.close(emoji);
  }

}

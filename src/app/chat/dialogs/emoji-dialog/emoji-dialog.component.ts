import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-emoji-dialog',
  templateUrl: './emoji-dialog.component.html',
  styleUrls: ['./emoji-dialog.component.scss']
})
export class EmojiDialogComponent implements OnInit {
  public emojiClicked = new EventEmitter<string>();

  constructor(
    public dialogRef: MatDialogRef<EmojiDialogComponent>
  ) { }

  ngOnInit() {
  }

}

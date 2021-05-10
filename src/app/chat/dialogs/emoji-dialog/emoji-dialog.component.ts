import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-emoji-dialog',
  templateUrl: './emoji-dialog.component.html',
  styleUrls: ['./emoji-dialog.component.scss']
})
export class EmojiDialogComponent implements OnInit {
  public emojiClicked = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<EmojiDialogComponent>
  ) { }

  ngOnInit() {
  }

}

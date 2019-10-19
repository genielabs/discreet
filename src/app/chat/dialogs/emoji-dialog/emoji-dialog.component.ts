import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-emoji-dialog',
  templateUrl: './emoji-dialog.component.html',
  styleUrls: ['./emoji-dialog.component.scss']
})
export class EmojiDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public eventEmitter: EventEmitter<string>,
    public dialogRef: MatDialogRef<EmojiDialogComponent>
  ) { }

  ngOnInit() {
  }

  onAddEmoji(emoji: string) {
    this.eventEmitter.emit(emoji);
    //this.dialogRef.close(emoji);
  }

}

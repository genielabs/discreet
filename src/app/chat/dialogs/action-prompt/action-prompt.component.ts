import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-action-prompt',
  templateUrl: './action-prompt.component.html',
  styleUrls: ['./action-prompt.component.scss']
})
export class ActionPromptComponent implements OnInit {
  actionText = 'saluta tutti!';

  constructor(
    @Inject(MAT_DIALOG_DATA) public username: string
  ) { }

  ngOnInit() {
    console.log(this.username);
  }

}

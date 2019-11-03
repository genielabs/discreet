import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-action-prompt',
  templateUrl: './action-prompt.component.html',
  styleUrls: ['./action-prompt.component.scss']
})
export class ActionPromptComponent {
  actionText = 'greets everyone!';

  constructor(
    @Inject(MAT_DIALOG_DATA) public username: string
  ) { }

}

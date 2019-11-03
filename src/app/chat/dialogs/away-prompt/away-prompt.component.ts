import {Component} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-away-prompt',
  templateUrl: './away-prompt.component.html',
  styleUrls: ['./away-prompt.component.scss']
})
export class AwayPromptComponent {
  awayText = 'Ain\'t here right now, but I\'ll be right back!';
}

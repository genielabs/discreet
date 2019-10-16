import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-nickname-prompt',
  templateUrl: './nickname-prompt.component.html',
  styleUrls: ['./nickname-prompt.component.scss']
})
export class NicknamePromptComponent implements OnInit {
  nick = 'Ospite-' + Math.ceil(Math.random() * 1000);
  password = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public loginInfo: any
  ) { }

  ngOnInit() {
  }

}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {LoginInfo} from '../irc-client/login-info';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  //nick = new FormControl('', [Validators.required, Validators.maxLength(15)]);
  @Output() connectRequest = new EventEmitter<LoginInfo>();
  nick = 'Ospite-' + Math.ceil(Math.random() * 1000);
  password = '';

  constructor() { }

  ngOnInit() {
  }

  onConnectClick() {
    this.connectRequest.emit({
      nick: this.nick,
      password: this.password
    });
  }
}

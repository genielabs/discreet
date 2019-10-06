import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  //nick = new FormControl('', [Validators.required, Validators.maxLength(15)]);
  @Output() connectRequest = new EventEmitter<string>();
  nick = 'Ospite-' + Math.ceil(Math.random() * 1000);

  constructor() { }

  ngOnInit() {
  }

  onConnectClick() {
    this.connectRequest.emit(this.nick);
  }
}

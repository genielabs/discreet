import { Component, OnInit } from '@angular/core';
import {IrcClient} from './irc-client';

@Component({
  selector: 'app-irc-client',
  templateUrl: './irc-client.component.html',
  styleUrls: ['./irc-client.component.scss']
})
export class IrcClientComponent implements OnInit {
  constructor(
    private ircClient: IrcClient
  ) { }

  ngOnInit() {
    this.ircClient.connect();
  }
}

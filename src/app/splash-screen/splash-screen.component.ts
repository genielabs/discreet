import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LoginInfo} from '../irc-client-service/login-info';
import {IrcClientService} from '../irc-client-service/irc-client-service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
  @Output() connectRequest = new EventEmitter<LoginInfo>();
  serverId = 'freenode.net';
  nick = 'Ospite-' + Math.ceil(Math.random() * 1000);
  password = '';

  constructor(
    public ircClientService: IrcClientService,
  ) { }

  ngOnInit() {
  }

  onConnectClick() {
    this.connectRequest.emit({
      server: this.ircClientService.serverList
        .find(server => server.id === this.serverId),
      nick: this.nick,
      password: this.password
    });
  }

  onServerSelectChange(e) {
    console.log(e.value);
    this.serverId = e.value;
  }

  filterCallback(server) {
    return !server.hidden;
  }
}

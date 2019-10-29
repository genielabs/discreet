import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LoginInfo} from '../irc-client-service/login-info';
import {IrcClientService} from '../irc-client-service/irc-client-service';
import {ActivatedRoute} from '@angular/router';

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

  singleServerMode = false;
  autoJoin = [] as string[];

  constructor(
    public ircClientService: IrcClientService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const serverId = params.s;
      let channelName = params.c;
      if (typeof channelName === 'string') {
        channelName = [ channelName ];
      }
      if (serverId) {
        const server = this.ircClientService.serverList
          .find(s => s.id === serverId);
        if (server) {
          this.singleServerMode = true;
          this.serverId = serverId;
          if (channelName) {
            this.autoJoin = channelName.map((s) => s.replace('!', '#'));
          }
        }
      }
    });
    this.ircClientService.loadConfiguration((c) => {
      this.nick = c.nick;
      this.password = c.password;
      this.serverId = c.server.id;
    });
  }

  onConnectClick() {
    this.connectRequest.emit({
      server: this.ircClientService.serverList
        .find(server => server.id === this.serverId),
      nick: this.nick,
      password: this.password,
      autoJoin: this.autoJoin
    } as LoginInfo);
  }

  onServerSelectChange(e) {
    console.log(e.value);
    this.serverId = e.value;
  }

  filterCallback(server) {
    return !server.hidden;
  }
}

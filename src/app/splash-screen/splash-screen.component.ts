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
  serverId: string;
  nick = 'Discreet-' + Math.ceil(Math.random() * 1000);
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
    this.loadConfiguration();
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
    this.serverId = e.value;
    this.loadConfiguration();
  }

  filterCallback(server) {
    return !server.hidden;
  }

  loadConfiguration() {
    this.ircClientService.loadConfiguration(this.serverId, (cfg, err) => {
      cfg = cfg || this.ircClientService.config;
      if (this.serverId) {
        this.ircClientService.config.server = this.ircClientService.serverList
          .find((s) => s.id === this.serverId);
      }
      this.nick = cfg.nick || this.nick;
      this.password = cfg.password;
      this.serverId = cfg.server.id;
    });
  }
}

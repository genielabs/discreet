import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ChatUser} from '../../chat-user';
import {IrcClientService} from '../../../irc-client-service/irc-client-service';
import {IrcUser} from '../../../irc-client-service/irc-user';

@Component({
  selector: 'app-user-info-dialog',
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.scss']
})
export class UserInfoDialogComponent implements OnInit {
  u: IrcUser;
  isLoadingData = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public chatUser: ChatUser,
    private ircClientService: IrcClientService
  ) {}

  ngOnInit() {
    this.u = this.chatUser.user;
    this.ircClientService.whoisReply
      .subscribe(reply => this.isLoadingData = false);
    this.ircClientService.whois(this.chatUser.name);
  }

  onVersionClick() {
    this.ircClientService.ctcp(this.chatUser.name, 'VERSION');
  }
}

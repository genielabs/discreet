import { Component, OnInit } from '@angular/core';
import {IrcClientService} from '../../../irc-client-service/irc-client-service';
import {IrcChannel} from '../../../irc-client-service/irc-channel';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit {
  isLoadingData = true;
  channelList: IrcChannel[] = [];
  searchFilter = '';

  constructor(private ircClientService: IrcClientService) { }

  ngOnInit() {
    this.ircClientService.channelsList.subscribe((channels) => {
      this.channelList = channels.slice();
      this.channelList.sort((a, b) => {
        return +a.users < +b.users ? 1 : -1;
      });
      this.isLoadingData = false;
    });
    this.ircClientService.list();
  }

}

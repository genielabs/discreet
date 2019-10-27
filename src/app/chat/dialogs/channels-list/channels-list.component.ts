import {Component, OnDestroy, OnInit} from '@angular/core';
import {IrcClientService} from '../../../irc-client-service/irc-client-service';
import {IrcChannel} from '../../../irc-client-service/irc-channel';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit, OnDestroy {
  isLoadingData = false;
  channelList = [] as IrcChannel[];
  channelsCount = 0;
  channelName = '';

  constructor(private ircClientService: IrcClientService) { }

  ngOnInit() {
    this.channelList = this.ircClientService.config.server.channels.slice();
    this.channelList.sort((a, b) => {
      return +a.users < +b.users ? 1 : -1;
    });
    this.channelsCount = this.channelList.length;
    this.ircClientService.channelsList.subscribe((channel: IrcChannel) => {
      this.channelsCount++;
      // channels list end signal (channel == null)
      if (channel == null) {
        const list = this.ircClientService.config.server.channels.slice();
        list.sort((a, b) => {
          return +a.users < +b.users ? 1 : -1;
        });
        this.channelList = list;
        this.isLoadingData = false;
      }
    });
  }

  ngOnDestroy(): void {
  }

  onListDownloadClick() {
    this.isLoadingData = true;
    this.channelList.length = this.channelsCount = 0;
    this.ircClientService.list();
  }

  elapsedFromListDownload() {
    const fromLastUpdate = (Date.now() - this.ircClientService.config.server.timestamp) / 1000;
    return Math.round(fromLastUpdate);
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {IrcClientService} from '../../../irc-client-service/irc-client-service';
import {IrcChannel} from '../../../irc-client-service/irc-channel';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss']
})
export class ChannelsListComponent implements OnInit, OnDestroy {
  isLoadingData = true;
  channelList = [] as IrcChannel[];
  searchFilter = '';

  private list = [] as IrcChannel[];
  private updateInterval;

  constructor(private ircClientService: IrcClientService) { }

  ngOnInit() {
    let ci = 0;
    this.ircClientService.channelsList.subscribe((channel: IrcChannel) => {
      if (channel == null) {
        this.isLoadingData = false;
      } else {
        this.list.push(channel);
        if (this.updateInterval == null) {
          this.updateInterval = setInterval(() => {
            if (ci < this.list.length) {
              this.channelList.push(this.list[ci++]);
            } else {
              clearInterval(this.updateInterval);
              this.channelList.sort((a, b) => {
                return +a.users < +b.users ? 1 : -1;
              });
              this.channelList = this.channelList.slice();
            }
          }, 1);
        }
      }
    });
    this.ircClientService.list();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

}

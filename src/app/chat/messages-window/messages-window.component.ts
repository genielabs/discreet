import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ScrollEvent} from 'ngx-scroll-event';
import {ChatData, ChatMessage} from '../chat-data';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-messages-window',
  templateUrl: './messages-window.component.html',
  styleUrls: ['./messages-window.component.scss']
})
export class MessagesWindowComponent implements OnInit {
  @ViewChild('chatBuffer', {static: true})
  chatBuffer: ElementRef;

  @Input()
  boundChat: ChatData;
  @Output()
  mediaUrlClick = new EventEmitter<any>();

  isLastMessageVisible = true;

  constructor() {}

  ngOnInit() {
  }

  handleScroll(event: ScrollEvent) {
//    console.log('scroll occurred', event.originalEvent);
    if (event.isReachingBottom) {
      console.log(`the user is reaching the bottom`);
      this.isLastMessageVisible = true;
      this.boundChat.stats.messages.new = 0;
    } else if (event.isReachingTop) {
      console.log(`the user is reaching the top`);
      this.isLastMessageVisible = false;
    } else {
      // scrolling
      this.isLastMessageVisible = false;
    }
    if (event.isWindowEvent) {
      console.log(`This event is fired on Window not on an element.`);
    }
  }

  onMessageClick(e) {
    console.log(e);
    if (e.target.tagName === 'A') {
      e.preventDefault();
      this.mediaUrlClick.emit({ id: e.target.dataset.id, link: e.target.dataset.link, element: e.target });
    }
  }

  onNewMessage(msg: any) {
    this.scrollLast();
  }

  bind(chat: ChatData) {
    this.boundChat = chat;
    this.scrollLast(true);
  }

  getTimeStamp(messages: ChatMessage[], i: number) {
    const startMessage = messages[i++];
    let timestamp = startMessage.timestamp;
    while (i < messages.length && messages[i].sender === startMessage.sender) {
      timestamp = messages[i++].timestamp;
    }
    return timestamp;
  }

  private scrollTimeout;
  scrollLast(force?: boolean, soft?: boolean) {
    if (this.scrollTimeout != null) {
      clearTimeout(this.scrollTimeout);
    }
    const el: HTMLElement = this.chatBuffer.nativeElement;
    if (force && !soft) {
      el.style['scroll-behavior'] = 'initial';
      this.scrollTimeout = setTimeout(() => {
        el.scrollTo(0, el.scrollHeight);
        el.style['scroll-behavior'] = 'smooth';
      }, 10);
    } else if (this.isLastMessageVisible || force) {
      this.scrollTimeout = setTimeout(() => { el.scrollTo(0, el.scrollHeight); }, 10);
    }
  }
}

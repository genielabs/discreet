import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ScrollEvent} from 'ngx-scroll-event';
import {ChatMessageType, ChatMessage} from '../chat-message';
import {PrivateChat} from '../private-chat';
import {PublicChat} from '../public-chat';

import * as smoothScroll from '../../../../node_modules/smoothscroll-polyfill';
import {TextFormatting} from '../text-formatting';

@Component({
  selector: 'app-messages-window',
  templateUrl: './messages-window.component.html',
  styleUrls: ['./messages-window.component.scss']
})
export class MessagesWindowComponent implements OnInit {
  private textFormatting = new TextFormatting();
  private scrollTimeout;

  @ViewChild('chatBuffer', {static: true})
  chatBuffer: ElementRef;

  @Input()
  boundChat: any;
  @Output()
  mediaUrlClick = new EventEmitter<any>();

  MessageType = ChatMessageType;
  isLastMessageVisible = true;

  constructor() {
    smoothScroll.polyfill();
  }

  ngOnInit() {
  }

  handleScroll(event: ScrollEvent) {
//    console.log('scroll occurred', event.originalEvent);
    if (event.isReachingBottom) {
      this.isLastMessageVisible = true;
      this.boundChat.stats.messages.new = 0;
    } else if (event.isReachingTop) {
      this.isLastMessageVisible = false;
    } else {
      // scrolling
      this.isLastMessageVisible = false;
    }
    // if (event.isWindowEvent) {
    //   console.log(`This event is fired on Window not on an element.`);
    // }
  }

  onMessageClick(e) {
    // Handle click on Anchor elements (YouTube and other external links)
    if (e.target.tagName === 'A') {
      e.preventDefault();
      this.mediaUrlClick.emit({ id: e.target.dataset.id, link: e.target.dataset.link, element: e.target });
    }
  }

  bind(chat: PrivateChat | PublicChat) {
    this.boundChat = chat;
    this.scrollLast(true);
  }

  isServiceMessage(msg) {
    return msg.type === ChatMessageType.JOIN
      || msg.type === ChatMessageType.PART
      || msg.type === ChatMessageType.QUIT
      || msg.type === ChatMessageType.KICK;
  }

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

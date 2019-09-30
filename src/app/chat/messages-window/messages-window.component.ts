import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-messages-window',
  templateUrl: './messages-window.component.html',
  styleUrls: ['./messages-window.component.scss']
})
export class MessagesWindowComponent implements OnInit {
  @ViewChild('chatBuffer', {static: true})
  chatBuffer: ElementRef;

  @Input()
  boundChat;

  @Output()
  sendMessage = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
  }

  bind(chat) {
    this.boundChat = chat;
    this.scrollLast(true);
  }

  onNewMessage(msg: any) {
    this.scrollLast();
  }

  private scrollLast(force?: boolean) {
    const el: HTMLElement = this.chatBuffer.nativeElement;
    if (force) {
      el.style['scroll-behavior'] = 'initial';
      setTimeout(() => {
        el.scrollTo(0, el.scrollHeight);
        el.style['scroll-behavior'] = 'smooth';
      });
    } else /* if (Math.round(el.scrollTop + el.offsetHeight) === el.scrollHeight) */ {
        setTimeout(() => { el.scrollTo(0, el.scrollHeight); });
    }
  }
}

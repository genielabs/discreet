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

  userMessage = '';

  constructor() {}

  ngOnInit() {
  }

  bind(chat) {
    this.boundChat = chat;
    this.scrollLast(true);
  }

  onAddEmoji(emoji) {
    console.log(emoji);
    this.userMessage += emoji.native + ' ';
  }
  onEnterKey(e) {
    this.sendMessage.emit(this.userMessage);
    this.userMessage = '';
    this.scrollLast(true);
  }

  onNewMessage(msg: any) {
    this.scrollLast();
  }

  private scrollLast(force?: boolean) {
    const el: HTMLElement = this.chatBuffer.nativeElement;
    if (force || Math.round(el.scrollTop + el.offsetHeight) === el.scrollHeight) {
      setTimeout(() => {
        el.scrollTo(0, el.scrollHeight);
      }, 10);
    }
  }
}

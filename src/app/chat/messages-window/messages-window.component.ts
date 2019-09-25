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
    this.scrollLast();
  }

  appendChatMessage(type, sender, target, message) {
    const el: HTMLElement = this.chatBuffer.nativeElement;
    sender = sender.split('!')[0];
    el.innerHTML += `
        <div class="message">&lt;${sender}&gt; ${message}</div>
      `;
    el.scrollTo(0, el.scrollHeight);
    /*
    .onscroll = function() {
  var d = document.documentElement;
  var offset = d.scrollTop + window.innerHeight;
  var height = d.offsetHeight;

  console.log('offset = ' + offset);
  console.log('height = ' + height);

  if (offset === height) {
    console.log('At the bottom');
  }
};
     */
  }

  onAddEmoji(emoji) {
    console.log(emoji);
    this.userMessage += emoji.native + ' ';
  }
  onEnterKey(e) {
//    this.ircClient.send(this.ircClient.testChannelName, this.userMessage);
//    this.appendChatMessage('PRIVMSG', 'NgIrc', this.ircClient.testChannelName, this.userMessage);
    this.sendMessage.emit(this.userMessage);
    this.userMessage = '';
  }

  onNewMessage(msg: any) {
    this.scrollLast();
  }

  private scrollLast() {
    const el: HTMLElement = this.chatBuffer.nativeElement;
    setTimeout(() => {
      el.scrollTo(0, el.scrollHeight);
    }, 10);
  }
}

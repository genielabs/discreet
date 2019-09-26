import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Injectable} from '@angular/core';

import {IrcClient} from '../../irc-client/irc-client';
import {MessagesWindowComponent} from '../messages-window/messages-window.component';
import {ChatHostDirective} from '../chat-host.directive';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  styleUrls: ['./chat-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChatManagerComponent implements OnInit {
  @ViewChild(ChatHostDirective, {static: true})
  private chatManagerHost: ChatHostDirective;
  @ViewChild(MessagesWindowComponent, {static: true})
  private messageWindow: MessagesWindowComponent;

  chatMessages = [];
  currentChat;

  @Output() chatClosed = new EventEmitter<any>();
  @Output() chatOpen = new EventEmitter<any>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private ircClient: IrcClient
  ) {
    this.ircClient.messageReceive.subscribe((msg) => {
      console.log('ChatMangerComponent', msg);
      const ni = msg.sender.indexOf('!');
      if (ni > 0 ) {
        msg.sender = msg.sender.substring(0, ni - 1);
      }
      if (this.chatMessages[msg.target] == null) {
        this.chatMessages[msg.target] = [];
        this.chatOpen.emit(msg.target);
        this.show(msg.target);
      }
      this.chatMessages[msg.target].push(msg);
      this.messageWindow.onNewMessage(msg);
    });
  }

  ngOnInit() {
    this.ircClient.connect();
  }

  onSendMessage(message) {
    const target = this.currentChat;
    this.ircClient.send(target, message);
    this.chatMessages[target].push({
      type: 'PRIVMSG',
      sender: '@localuser',
      target,
      message
    });
  }

  show(chatName) {
    this.currentChat = chatName;
    this.messageWindow.bind(this.chatMessages[chatName]);
  }

}

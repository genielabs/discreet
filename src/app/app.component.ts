import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  chatList: string[] = [];
  title = 'ng-web-irc';

  onChatOpen(sender) {
    this.chatList.push(sender);
  }

}

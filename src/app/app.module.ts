import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { AppComponent } from './app.component';
import { IrcClientComponent } from './irc-client/irc-client.component';
import { MessagesWindowComponent } from './chat/messages-window/messages-window.component';
import { IrcClient } from './irc-client/irc-client';
import { ChatHostDirective } from './chat/chat-host.directive';
import { ChatManagerComponent } from './chat/chat-manager/chat-manager.component';
import {MatBadgeModule, MatSidenavModule, MatToolbarModule} from '@angular/material';
import {ScrollingModule} from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    IrcClientComponent,
    MessagesWindowComponent,
    ChatManagerComponent,
    ChatHostDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    ScrollingModule,
    PickerModule
  ],
  entryComponents: [MessagesWindowComponent],
  providers: [HttpClientModule, IrcClient, ChatManagerComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }

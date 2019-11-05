import { LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatIconModule,
  MatBadgeModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTabsModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MatCardModule, MatTooltipModule, MatProgressBarModule, MatSelectModule
} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRippleModule } from '@angular/material/core';

import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ScrollEventModule } from 'ngx-scroll-event';

import { AppComponent } from './app.component';
import { MessagesWindowComponent } from './chat/messages-window/messages-window.component';
import { IrcClientService } from './irc-client-service/irc-client-service';
import { ChatManagerComponent } from './chat/chat-manager/chat-manager.component';
import { EnrichMessage } from './chat/pipes/enrich-message.pipe';
import { SortByPipe } from './chat/pipes/sort-by.pipe';
import { YoutubeVideoComponent } from './socialmedia/youtube-video/youtube-video.component';
import { SafePipe } from './chat/pipes/safe.pipe';
import { EmojiDialogComponent } from './chat/dialogs/emoji-dialog/emoji-dialog.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {DeviceDetectorModule} from 'ngx-device-detector';
import { MediaPlaylistComponent } from './chat/dialogs/media-playlist/media-playlist.component';
import { ActionPromptComponent } from './chat/dialogs/action-prompt/action-prompt.component';
import { AwayPromptComponent } from './chat/dialogs/away-prompt/away-prompt.component';
import { NicknamePromptComponent } from './chat/dialogs/nickname-prompt/nickname-prompt.component';
import {CallbackPipe} from './chat/pipes/callback.pipe';
import {RouterModule} from '@angular/router';
import { ChannelsListComponent } from './chat/dialogs/channels-list/channels-list.component';
import { UserInfoDialogComponent } from './chat/dialogs/user-info-dialog/user-info-dialog.component';

import {MomentModule} from 'ngx-moment';
import 'moment/locale/it';
import {NgxTributeModule} from 'ngx-tribute';
import {PouchDBService} from './services/pouchdb.service';
import {EncrDecrService} from './services/encr-decr.service';
import {SettingsService} from './services/settings.service';
import { YoutubeSearchComponent } from './chat/dialogs/youtube-search/youtube-search.component';

@NgModule({
  declarations: [
    AppComponent,
    MessagesWindowComponent,
    ChatManagerComponent,
    EnrichMessage,
    SortByPipe,
    CallbackPipe,
    YoutubeVideoComponent,
    SafePipe,
    EmojiDialogComponent,
    SplashScreenComponent,
    MediaPlaylistComponent,
    ActionPromptComponent,
    AwayPromptComponent,
    NicknamePromptComponent,
    ChannelsListComponent,
    UserInfoDialogComponent,
    YoutubeSearchComponent
  ],
  imports: [
    // angular
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    // moment.js
    MomentModule,
    // material
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ScrollingModule,
    MatRippleModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    // third party
    NgxTributeModule,
    ScrollEventModule,
    PickerModule,
    RouterModule.forRoot([], {useHash: true}),
    DeviceDetectorModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  entryComponents: [
    EmojiDialogComponent,
    MediaPlaylistComponent,
    ActionPromptComponent,
    AwayPromptComponent,
    NicknamePromptComponent,
    ChannelsListComponent,
    UserInfoDialogComponent,
    YoutubeSearchComponent
  ],
  providers: [
    HttpClientModule,
    IrcClientService,
    ChatManagerComponent,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}},
    {provide: LOCALE_ID, useValue: 'it-IT'},
    PouchDBService,
    EncrDecrService,
    SettingsService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}

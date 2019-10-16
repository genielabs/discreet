import {Component, HostListener, OnInit} from '@angular/core';

export enum PlayStateEnum {
  UNDEFINED = -1,
  READY,
  PLAYING,
  PAUSED,
  ENDED
}

@Component({
  selector: 'app-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrls: ['./youtube-video.component.scss']
})
export class YoutubeVideoComponent implements OnInit {
  playState: PlayStateEnum = PlayStateEnum.UNDEFINED;
  PlayState = PlayStateEnum;
  isFullScreen = false;

  private YT: any;
  private player: any;
  private reframed = false;
  private iframe;

  public videoId: any;
  public isMinimized = true;
  public hasMargin = true;

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullScreenMode(e) {
    this.isFullScreen = !this.isFullScreen;
  }

  init() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  constructor() {
  }

  ngOnInit() {
    this.init();

    window['onYouTubeIframeAPIReady'] = (e) => {
      this.YT = window['YT'];
      this.reframed = false;
      this.player = new window['YT'].Player('youtube-player', {
        // videoId: this.video,
        playerVars: {
          modestbranding: 1, // no youtube logo
          wmode: 'transparent',
          autoplay: 1,
          controls: 0,
          fs: 0, // no full screen
          rel: 0, // no similar video list at the end
          showinfo: 0, // no video info at start
        },
        width: '100%', // 100 // 240
        height: '100%', // 56 // 135
        events: {
          onStateChange: this.onPlayerStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
          onReady: (event: any) => {
            this.playState = PlayStateEnum.READY;
            this.player = event.target;
            if (!this.reframed) {
              this.reframed = true;
              this.iframe = event.target.a;
              // reframe(e.target.a);
            }
          }
        }
      });
    };
  }

  onMenuControlPause() {
    this.player.pauseVideo();
  }

  onMenuControlPlay() {
    this.player.setVolume(30);
    this.player.playVideo();
  }

  onMenuControlFullScreen() {
    //this.player.playVideo(); // TODO: won't work on mobile
    const iframe = this.iframe;
    const requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
    if (requestFullScreen) {
      requestFullScreen.bind(iframe)();
    }
  }

  onMenuControlMinimize() {
    this.isMinimized = true;
  }

  onMenuControlExpand() {
    this.isMinimized = false;
  }

  onMenuControlClose() {
    this.closePlayer();
  }

  closePlayer() {
    this.player.stopVideo();
    this.videoId = null;
  }

  onPlayerStateChange(event) {
    console.log('PLAYER STATE', event);
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        this.playState = PlayStateEnum.PLAYING;
        if (this.cleanTime() === 0) {
          console.log('started ' + this.cleanTime());
        } else {
          console.log('playing ' + this.cleanTime())
        }
        break;
      case window['YT'].PlayerState.PAUSED:
        this.playState = PlayStateEnum.PAUSED;
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
        }
        break;
      case window['YT'].PlayerState.ENDED:
        this.playState = PlayStateEnum.ENDED;
        console.log('ended ');
        this.closePlayer();
        break;
    }
  }

  //utility

  toggleRightMargin(hasMargin: boolean) {
    this.hasMargin = hasMargin;
  }
  loadVideo(id: string) {
    this.videoId = id;
    this.player.loadVideoById(id);
    this.player.playVideo();
  }

  private cleanTime() {
    return Math.round(this.player.getCurrentTime());
  }

  private onPlayerError(event) {
    console.log('YOUTUBE PLAYER ERROR!!', event);
    switch (event.data) {
      case 2:
        console.log('' + this.videoId)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
  }
}

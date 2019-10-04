import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrls: ['./youtube-video.component.scss']
})
export class YoutubeVideoComponent implements OnInit {
  private safeUrl: string;

  public YT: any;
  public video: any;
  public player: any;
  public reframed = false;

  init() {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  constructor(private sanitizer: DomSanitizer) {
    this.safeUrl = this.sanitizer
      .bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/WovwuOFBUuY')
      .toString();
  }

  ngOnInit() {
    this.init();
    this.video = 'lgAmno8icDM'; // video id

    window['onYouTubeIframeAPIReady'] = (e) => {
      this.YT = window['YT'];
      this.reframed = false;
      this.player = new window['YT'].Player('youtube-player', {
        videoId: this.video,
        autoplay: 1,
        controls: 0,
        width: 100, // 240
        height: 56, // 135
        events: {
          onStateChange: this.onPlayerStateChange.bind(this),
          onError: this.onPlayerError.bind(this),
          onReady: (event: any) => {
            event.target.setVolume(100);
            event.target.playVideo();
            if (!this.reframed) {
              this.reframed = true;
              // reframe(e.target.a);
            }
          }
        }
      });
    };
  }

  onPlayerStateChange(event) {
    console.log(event);
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          console.log('started ' + this.cleanTime());
        } else {
          console.log('playing ' + this.cleanTime())
        }
        break;
      case window['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
        }
        break;
      case window['YT'].PlayerState.ENDED:
        console.log('ended ');
        break;
    }
  }
  //utility
  cleanTime() {
    return Math.round(this.player.getCurrentTime());
  }
  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    }
  }
}

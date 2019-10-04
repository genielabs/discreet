import {Observable, Observer, zip} from 'rxjs';
import {MediaInfo} from './pipes/enrich-message.pipe';
import {HttpClient, HttpXhrBackend} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

export interface MediaInfo {
  //
  // SEE: https://noembed.com for further info
  //
  html: string; // `\n<iframe width=\" 480\" height=\"270\" src=\"https://www.youtube.com/embed/srkdnRhnHPM?feature=oembed\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"></iframe>\n`;
  version: string; // '1.0';
  height: number; // 270;
  thumbnail_url: string; // 'https://i.ytimg.com/vi/srkdnRhnHPM/hqdefault.jpg';
  thumbnail_width: number; // 480;
  url: string; // 'https://www.youtube.com/watch?v=srkdnRhnHPM';
  author_name: string; // 'TheChudovische';
  title: string; // 'Amy Winehouse - Live at Porchester Hall [2007]';
  width: number; // 480;
  provider_name: string; // 'YouTube';
  provider_url: string; // 'https://www.youtube.com/';
  thumbnail_height: number; // 360;
  type: string; // 'video';
  author_url: string; // 'https://www.youtube.com/user/TheChudovische';
  originalUrl: string; // '[https://www.youtube.com/watch?v=srkdnRhnHPM]';
}

export class EnrichmentResult {
  enriched: string;
  mediaInfo?: MediaInfo;
}

export class TextFormatting {
  static mediaUrlsCache: MediaInfo[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  enrich(value): Observable<EnrichmentResult> {
    const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
    const text = this.createTextLinks(value);
    return new Observable<EnrichmentResult>((observer: Observer<EnrichmentResult>) => {
      observer.next({ enriched: text.replaced });
      text.urls.forEach((url) => {
        const cached = TextFormatting.mediaUrlsCache.find((v) => v.originalUrl === url || v.url === url);
        if (cached != null) {
          observer.next({
            enriched: text.replaced.replace(`[${url}]`, `${cached.title} (${cached.provider_name})`),
            mediaInfo: cached
          });
          return;
        }
        const o = httpClient.get(`https://noembed.com/embed?url=${url}`);
        o.subscribe((res: MediaInfo) => {
          if (res && res.title) {
            res.originalUrl = url;
            TextFormatting.mediaUrlsCache.push(res);
            observer.next({
              enriched: text.replaced.replace(`[${url}]`, `${res.title} (${res.provider_name})`),
              mediaInfo: res
            });
          } else {
            observer.next({
              enriched: text.replaced.replace(`[${url}]`, url)
            });
          }
        }, (err) => {
          // TODO: ...
          observer.next({
            enriched: text.replaced.replace(`[${url}]`, url)
          });
        }, () => {
          observer.complete();
        });
      });
    });
  }

  createTextLinks(text: string) {
    const urls: string[] = [];
    const replaced = (text || '').replace(
      /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
      (match, space, url) => {
        let hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink;
        }
        urls.push(url);
        let videoId = '';
        if (hyperlink.indexOf('v=') === -1) {
          videoId = hyperlink.substring(hyperlink.lastIndexOf('/') + 1);
        } else {
          videoId = hyperlink.split('v=')[1];
          const ampersandPosition = videoId.indexOf('&');
          if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
          }
        }
        const mediaUrl = `<a style="cursor:pointer;" data-id="${videoId}" data-link="${hyperlink}">[${url}]</a>`;
        return space + mediaUrl;
      }
    );
    return { replaced, urls };
  }

}

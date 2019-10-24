import { Pipe, PipeTransform } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Observer, zip} from 'rxjs';
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

@Pipe({
  name: 'enrichMessage'
})
export class EnrichMessage implements PipeTransform {
  static mediaUrlsCache: MediaInfo[] = [];

  enrich(value, httpClient: HttpClient): Observable<string> {
    const text = this.createTextLinks_(value);
    return new Observable<string>((observer: Observer<string>) => {
      observer.next(text.replaced);
      const pending: Observable<any>[] = [];
      text.urls.forEach((url) => {
        const cached = EnrichMessage.mediaUrlsCache.find((v) => v.originalUrl === url || v.url === url);
        if (cached != null) {
          observer.next(text.replaced.replace(`[${url}]`, `${cached.title} (${cached.provider_name})`));
          return;
        }
        const o = httpClient.get(`https://noembed.com/embed?url=${url}`);
        pending.push(o);
        o.subscribe((res: MediaInfo) => {
          if (res && res.title) {
            res.originalUrl = url;
            EnrichMessage.mediaUrlsCache.push(res);
            observer.next(text.replaced.replace(`[${url}]`, `${res.title} (${res.provider_name})`));
            console.log(res);
          } else {
            observer.next(text.replaced.replace(`[${url}]`, url));
          }
        }, (err) => {
          // TODO: ...
          observer.next(text.replaced.replace(`[${url}]`, url));
        });
      });
      zip(...pending).subscribe((res) => {
        observer.complete();
      });
    });
  }

  createTextLinks_(text: string) {
    const urls: string[] = [];
    const replaced = (text || '').replace(
      /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
      (match, space, url) => {
        let hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink;
        }
        urls.push(url);
        const mediaUrl = '<a href="' + hyperlink + '">[' + url + ']</a>';
        this.sanitizer.bypassSecurityTrustHtml(mediaUrl);
        return space + mediaUrl;
      }
    );
    return { replaced, urls };
  }

  constructor(private sanitizer: DomSanitizer, private httpClient: HttpClient) {}

  transform(value: string, ...args: any[]): any {
    this.enrich(value, this.httpClient);
  }

}

import { Injectable } from '@angular/core';
import * as search from 'youtube-search';

@Injectable({
  providedIn: 'root'
})
export class YoutubeSearchService {
  // Discreet PWA official API Key for searchinng public YT videos
  private apiKey = 'AIzaSyC_tAE9m1UBb-rsv-sthNWb2NyDkhWG8-c';

  constructor() { }

  search(query: string, callback) {
    const opts: search.YouTubeSearchOptions = {
      maxResults: 20,
      type: 'video',
      key: this.apiKey
    };
    search(query, opts, (err, results) => {
      if (err) {
        return console.log(err);
      }
      if (callback) {
        callback(results);
      }
    });
  }

}

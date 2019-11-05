import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {YoutubeSearchService} from '../../../services/youtube-search.service';

@Component({
  selector: 'app-youtube-search',
  templateUrl: './youtube-search.component.html',
  styleUrls: ['./youtube-search.component.scss']
})
export class YoutubeSearchComponent implements OnInit {
  @ViewChild('inputElement', {static: true}) searchInput: ElementRef;
  searchText = '';
  searchResults = [];
  minLength = 3;

  isLoading = false;

  constructor(
    private youTubeSearch: YoutubeSearchService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 200);
  }

  onSearchClick(e) {
    if (this.searchText.length >= this.minLength) {
      this.isLoading = true;
      this.searchResults = [];
      this.youTubeSearch.search(this.searchText, (results) => {
        this.searchResults = results;
        this.isLoading = false;
      });
    }
  }
}

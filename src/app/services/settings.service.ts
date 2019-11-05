import { Injectable } from '@angular/core';
import {PouchDBService} from './pouchdb.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  settings = {
    isDarkTheme: false,
    showColors: true
  };

  private updateDbTimeout;

  constructor(private pouchDbService: PouchDBService) { }

  public loadSettings() {
    this.pouchDbService.get('settings').then(settings => {
      this.settings = settings;
    }).catch(err => {
      console.log('Error loading settings.', err);
    });
  }
  public saveSettings() {
    if (this.updateDbTimeout) {
      if (this.updateDbTimeout !== true) {
        clearTimeout(this.updateDbTimeout);
      }
      this.updateDbTimeout = setTimeout(this.saveSettings.bind(this), 500);
      return;
    }
    this.updateDbTimeout = true;
    // update db
    this.pouchDbService.put('settings', this.settings).then((res) => {
      this.updateDbTimeout = false;
    }).catch(err => {
      this.updateDbTimeout = false;
    });
  }

}


/**
 stringToColour = (str) => {
  let hash = 0;
  for (const i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (const i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}
 */

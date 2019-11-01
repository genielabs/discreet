import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ThemeService {
  private darkTheme: Subject<boolean> = new Subject<boolean>();
  isDarkTheme = this.darkTheme.asObservable();

  setDarkTheme(isDarkTheme: boolean) {
    this.darkTheme.next(isDarkTheme);
  }
}

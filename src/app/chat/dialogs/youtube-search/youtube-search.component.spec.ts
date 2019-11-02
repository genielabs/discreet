import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeSearchComponent } from './youtube-search.component';

describe('YoutubeSearchComponent', () => {
  let component: YoutubeSearchComponent;
  let fixture: ComponentFixture<YoutubeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

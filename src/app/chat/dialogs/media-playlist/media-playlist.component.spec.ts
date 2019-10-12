import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPlaylistComponent } from './media-playlist.component';

describe('MediaPlaylistComponent', () => {
  let component: MediaPlaylistComponent;
  let fixture: ComponentFixture<MediaPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

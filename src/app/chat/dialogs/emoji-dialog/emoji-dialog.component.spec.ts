import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiDialogComponent } from './emoji-dialog.component';

describe('EmojiDialogComponent', () => {
  let component: EmojiDialogComponent;
  let fixture: ComponentFixture<EmojiDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmojiDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmojiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

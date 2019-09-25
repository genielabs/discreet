import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesWindowComponent } from './messages-window.component';

describe('MessagesWindowComponent', () => {
  let component: MessagesWindowComponent;
  let fixture: ComponentFixture<MessagesWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IrcClientComponent } from './irc-client.component';

describe('IrcClientComponent', () => {
  let component: IrcClientComponent;
  let fixture: ComponentFixture<IrcClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IrcClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IrcClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

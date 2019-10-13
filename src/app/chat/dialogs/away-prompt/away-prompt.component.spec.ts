import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwayPromptComponent } from './away-prompt.component';

describe('AwayPromptComponent', () => {
  let component: AwayPromptComponent;
  let fixture: ComponentFixture<AwayPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwayPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwayPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

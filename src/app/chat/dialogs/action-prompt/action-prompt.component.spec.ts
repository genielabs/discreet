import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPromptComponent } from './action-prompt.component';

describe('ActionPromptComponent', () => {
  let component: ActionPromptComponent;
  let fixture: ComponentFixture<ActionPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

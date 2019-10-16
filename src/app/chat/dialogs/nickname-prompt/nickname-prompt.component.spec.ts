import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NicknamePromptComponent } from './nickname-prompt.component';

describe('NicknamePromptComponent', () => {
  let component: NicknamePromptComponent;
  let fixture: ComponentFixture<NicknamePromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NicknamePromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NicknamePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

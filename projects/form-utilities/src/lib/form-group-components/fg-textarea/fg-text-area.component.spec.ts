import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FgTextAreaComponent } from './fg-text-area.component';

describe('FgTextboxComponent', () => {
  let component: FgTextAreaComponent;
  let fixture: ComponentFixture<FgTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FgTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FgTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

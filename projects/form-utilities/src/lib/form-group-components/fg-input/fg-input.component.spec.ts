import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FgInputComponent } from './fg-input.component';

describe('InputTextComponent', () => {
  let component: FgInputComponent;
  let fixture: ComponentFixture<FgInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FgInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FgInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

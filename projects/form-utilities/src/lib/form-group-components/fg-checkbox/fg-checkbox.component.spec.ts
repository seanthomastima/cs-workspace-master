import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FgCheckboxComponent } from './fg-checkbox.component';

describe('CheckboxComponent', () => {
  let component: FgCheckboxComponent;
  let fixture: ComponentFixture<FgCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FgCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FgCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

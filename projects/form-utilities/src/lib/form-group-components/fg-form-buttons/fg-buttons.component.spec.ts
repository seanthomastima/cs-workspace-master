import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FgButtonsComponent } from './fg-buttons.component';

describe('FormButtonsComponent', () => {
  let component: FgButtonsComponent;
  let fixture: ComponentFixture<FgButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FgButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FgButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

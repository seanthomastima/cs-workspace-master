import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FgButtonsSingleComponent } from './fg-buttons-single.component';

describe('FormButtonsSingleComponent', () => {
  let component: FgButtonsSingleComponent;
  let fixture: ComponentFixture<FgButtonsSingleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FgButtonsSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FgButtonsSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

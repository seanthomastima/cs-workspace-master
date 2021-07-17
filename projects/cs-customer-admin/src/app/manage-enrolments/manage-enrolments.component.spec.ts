import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEnrolmentsComponent } from './manage-enrolments.component';

describe('EnrolmentsComponent', () => {
  let component: ManageEnrolmentsComponent;
  let fixture: ComponentFixture<ManageEnrolmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageEnrolmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEnrolmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChecklistsComponent } from './manage-checklists.component';

describe('ManageChecklistsComponent', () => {
  let component: ManageChecklistsComponent;
  let fixture: ComponentFixture<ManageChecklistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageChecklistsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageChecklistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

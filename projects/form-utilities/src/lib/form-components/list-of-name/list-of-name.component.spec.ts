import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfNameComponent } from './list-of-name.component';

describe('ListOfNameComponent', () => {
  let component: ListOfNameComponent;
  let fixture: ComponentFixture<ListOfNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListOfNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOfNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Heading1Component } from './heading1.component';

describe('Heading1Component', () => {
  let component: Heading1Component;
  let fixture: ComponentFixture<Heading1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Heading1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Heading1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { SuperAdministratorsService } from './super-administrators.service';

describe('SuperAdministratorsService', () => {
  let service: SuperAdministratorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperAdministratorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CustomerAdministratorService } from './customer-administrator.service';

describe('CustomerAdministratorService', () => {
  let service: CustomerAdministratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerAdministratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

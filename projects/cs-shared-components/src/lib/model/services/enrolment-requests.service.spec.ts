import { TestBed } from '@angular/core/testing';

import { EnrolmentRequestsService } from './enrolment-requests.service';

describe('EnrolmentsService', () => {
  let service: EnrolmentRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnrolmentRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

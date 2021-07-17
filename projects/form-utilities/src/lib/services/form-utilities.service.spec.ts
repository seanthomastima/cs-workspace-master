import { TestBed } from '@angular/core/testing';

import { FormUtilitiesService } from './form-utilities.service';

describe('FormUtilitiesService', () => {
  let service: FormUtilitiesService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormUtilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

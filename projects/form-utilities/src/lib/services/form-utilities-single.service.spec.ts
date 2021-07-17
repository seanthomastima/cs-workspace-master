import { TestBed } from '@angular/core/testing';

import { FormUtilitiesSingleService } from './form-utilities-single.service';

describe('FormUtilitiesSingleService', () => {
  let service: FormUtilitiesSingleService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormUtilitiesSingleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

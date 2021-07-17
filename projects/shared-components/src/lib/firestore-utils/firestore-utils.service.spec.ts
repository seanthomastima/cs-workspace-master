import { TestBed } from '@angular/core/testing';

import { FirestoreUtilsService } from './firestore-utils.service';

describe('FirestoreUtilsService', () => {
  let service: FirestoreUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

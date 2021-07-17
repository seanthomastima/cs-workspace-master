import { TestBed, inject } from '@angular/core/testing';

import { SelectUserDialogService } from './select-user-dialog.service';

describe('SelectUserDialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelectUserDialogService]
    });
  });

  it('should be created', inject([SelectUserDialogService], (service: SelectUserDialogService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed } from '@angular/core/testing';

import { SelectTeamDialogService } from './select-team-dialog.service';

describe('SelectTeamDialogService', () => {
  let service: SelectTeamDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectTeamDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

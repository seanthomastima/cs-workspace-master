import { Injectable }                                                                                       from '@angular/core';
import { MatDialog, MatDialogRef }                                                                          from '@angular/material/dialog';
import { SelectTeamDialogComponent }                                                                        from './select-team-dialog.component';
import { Team }                                                                                             from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class SelectTeamDialogService {

  selectTeamDialogComponent:        MatDialogRef<SelectTeamDialogComponent>;

  constructor(private dialog: MatDialog) { }

  public selectTeam(): Promise<Team> {

    this.selectTeamDialogComponent = this.dialog.open(SelectTeamDialogComponent);

    return new Promise((resolve) => {

      this.selectTeamDialogComponent
        .afterClosed()
        .subscribe((team: Team) => {
          resolve(team);
        });

    });
  }

}

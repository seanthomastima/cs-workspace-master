import { Component, OnDestroy, OnInit }                                                             from '@angular/core';
import { SignInContext }                                                                            from '../../model/security/sign-in-context';
import { Subject }                                                                                  from 'rxjs';
import { MatDialogRef }                                                                             from '@angular/material/dialog';
import { LocalDataService }                                                                         from '../../model/services/local-data.service';
import { AuthService }                                                                              from '../../model/services/auth.service';
import { Team }                                                                                     from 'cs-shared-components';

@Component({
  selector: 'select-team-dialog',
  templateUrl: './select-team-dialog.component.html',
  styleUrls: []
})
export class SelectTeamDialogComponent implements OnInit, OnDestroy {

  team:                             Team;
  teams:                            Team[];
  filteredTeams:                    Team[];
  filter:                           string;
  signInContext:                    SignInContext;
  destroy$                          = new Subject();


  constructor(private selectTeamDialogComponent:  MatDialogRef<SelectTeamDialogComponent>,
              private localDataService:           LocalDataService,
              private authService:                AuthService) { }

  ngOnInit() {

    this.authService.signInContext$
      .subscribe(signInContext => this.signInContext = signInContext);

    this.localDataService.teams$
      .subscribe(teams => {

        this.filteredTeams = teams;

        this.teams = teams;

      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }


  select() {

    this.selectTeamDialogComponent.close(this.team);

  }

  cancel() {

    this.selectTeamDialogComponent.close(null);

  }

  onClick(team: Team) {

    this.team = team;

  }

  filterList() {

    this.filteredTeams = this.teams.filter(
      team => {
        return team.name.toLowerCase().includes(this.filter.toLowerCase());
      });

  }


}

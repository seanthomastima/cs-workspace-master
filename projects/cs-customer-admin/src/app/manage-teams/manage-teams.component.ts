import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                   from '@angular/core';
import { SignInContext }                                                                                        from '../model/security/sign-in-context';
import { combineLatest, from, Observable, of, Subject }                                                         from 'rxjs';
import { MatSnackBar }                                                                                          from '@angular/material/snack-bar';
import { FormBuilder, FormGroup }                                                                               from '@angular/forms';
import { LocalDataService }                                                                                     from '../model/services/local-data.service';
import { WindowSizeService }                                                                                    from '../model/services/window-size.service';
import { first, flatMap, map, takeUntil, tap, toArray }                                                         from 'rxjs/operators';
import { AuthService }                                                                                          from '../model/services/auth.service';
import { TeamService }                                                                                          from '../model/services/team.service';
import { RoleService }                                                                                          from '../model/services/role.service';
import { ConfirmationDialogService, MessageDialogService }                                                      from 'shared-components';
import { FormUtilitiesService }                                                                                 from 'form-utilities';
import { Role, Team }                                                                                           from 'cs-shared-components';


class DisplayObject {
  FSKey:                string;
  team                  = new Team();
  teamMemberRoles:      Role[] = [];
}

@Component({
  selector: 'manage-teams',
  templateUrl: './manage-teams.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]
})
export class ManageTeamsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  destroy$                            = new Subject();
  windowSize$                         = this.windowSizeService.windowSize$;

  constructor(public fuService:                     FormUtilitiesService<DisplayObject>,
              private snackBar:                     MatSnackBar,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private confirmationDialogService:    ConfirmationDialogService,
              private messageDialogService:         MessageDialogService,
              private roleService:                  RoleService,
              private teamService:                  TeamService,
              private authService:                  AuthService) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      name:               [''],
      description:        ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {
      item.team.name               = formGroup.controls['name'].value.trim();
      item.team.description        = formGroup.controls['description'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.team.name,
        description:          item.team.description
      });
    };

    this.fuService.filterList = (filterString: string, list: DisplayObject[], filteredList: DisplayObject[]): DisplayObject[] => {

      return list.filter(
        displayObject => {
          return displayObject.team.name.toLowerCase().includes(filterString.toLowerCase());
        });

    };

  }

  ngOnInit() {

    this.localDataService.teams$
      .pipe(
        flatMap(teams => this.createDisplayObjectsFromTeams(teams)),
        takeUntil(this.destroy$),
      )
      .subscribe(displayObjects => {
        this.fuService.items = JSON.parse(JSON.stringify(displayObjects));
        this.fuService.filteredItems  = JSON.parse(JSON.stringify(displayObjects));
      });

    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => this.signInContext = signInContext);

    this.fuService.externalSave = () => { this.save(); };

    this.fuService.externalDelete = () => { this.delete(); };

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  ngAfterViewInit() {

    this.windowSize$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(windowSize => {
        const widthString = `${windowSize.sideMenuWidth}px`;
        this.mainDiv.nativeElement.style.marginLeft = widthString;
      });

  }

  createDisplayObjectsFromTeams(teams: Team[]): Observable<DisplayObject[]> {

    return from(teams)
      .pipe(
        flatMap(team => combineLatest([
          of(team),
          this.authService.signInContext$.pipe(first())
        ])),
        flatMap(([team, signInContext]) => combineLatest([
          of(team),
          this.roleService.getRolesFromFSKeys(signInContext, team.teamMemberRoleFSKeys)
        ])),
        map(([team, roles]) => {

          // Update teamMemberRoleFSKeys to only include FSKeys for valid Roles
          // If a Role has been deleted then an invalid FSKey may linger in teamMemberRoleFSKeys
          // When this Team is next saved the teamMemberRoleFSKeys will be updated.
          team.teamMemberRoleFSKeys = roles.map(role => role.FSKey);

          const displayObject           = new DisplayObject();
          displayObject.FSKey           = team.FSKey;
          displayObject.team            = team;
          displayObject.teamMemberRoles = roles;

          return displayObject;

        }),
        toArray()
      );

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.team.FSKey !== this.fuService.item.team.FSKey);

  }

  addNew() {

    this.fuService.addNew(new DisplayObject());

  }

  save(){

    if (this.checkValidFormEntries().length > 0 ) {

      return;

    }

    if (this.fuService.pageState === this.fuService.pageStateOptions.ADD) {

      this.teamService.addTeam(this.signInContext.customer.FSKey, this.fuService.item.team);

      this.fuService.openSnackBar('Team added: ' + this.fuService.item.team.name);

    } else {

      this.teamService.updateTeam(this.signInContext.customer.FSKey, this.fuService.item.team);

      this.fuService.openSnackBar('Team updated: ' + this.fuService.item.team.name);

    }

    this.fuService.cancel();

  }

  checkValidFormEntries(): string[] {

    this.fuService.errorMessages = [];

    if (!this.fuService.item.team.name.trim()) {

      this.fuService.errorMessages.push('Name field is required');

    }

    return this.fuService.errorMessages;

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete Team?')
      .then(confirmed => {

        if (confirmed) {

          this.teamService.deleteTeam(this.signInContext.customer.FSKey, this.fuService.item.team.FSKey);

          this.fuService.cancel();
        }

      });

  }

  setSharedWithChanged(changed) {

    if (changed) {

      this.fuService.addExternalChange('SharedWith');

    } else {

      this.fuService.removeExternalChange('SharedWith');

    }

    this.fuService.updateItemChanged();

  }

  setSharedWithRoles(sharedWithRoles) {

    from(sharedWithRoles)
      .pipe(
        map((role: Role) => role.FSKey),
        toArray()
      )
      .subscribe(roleFSKeys => this.fuService.item.team.teamMemberRoleFSKeys = roleFSKeys);

  }

}

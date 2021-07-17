import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                   from '@angular/core';
import { FormBuilder, FormGroup }                                                                               from '@angular/forms';
import { AuthService}                                                                                           from '../model/services/auth.service';
import { UserService }                                                                                          from '../model/services/user.service';
import { Customer }                                                                                             from '../../../../cs-shared-components/src/lib/model/classes/customer';
import { filter, flatMap, map, takeUntil, tap, toArray }                                                        from 'rxjs/operators';
import { combineLatest, from, Observable, of, Subject }                                                         from 'rxjs';
import { SignInContext }                                                                                        from '../model/security/sign-in-context';
import { LocalDataService }                                                                                     from '../model/services/local-data.service';
import { RoleService }                                                                                          from '../model/services/role.service';
import { CustomerService }                                                                                      from '../model/services/customer.service';
import { SelectRoleDialogService }                                                                              from '../dialogs/select-role-dialog/select-role-dialog.service';
import { SelectUserDialogService }                                                                              from '../dialogs/select-user-dialog/select-user-dialog.service';
import { WindowSizeService }                                                                                    from '../model/services/window-size.service';
import { SelectTeamDialogService }                                                                              from '../dialogs/select-team-dialog/select-team-dialog.service';
import { TeamService }                                                                                          from '../model/services/team.service';
import { ConfirmationDialogService }                                                                            from 'shared-components';
import { FormUtilitiesService }                                                                                 from 'form-utilities';
import { Role }                                                                                                 from 'cs-shared-components';

class DisplayObject {
  FSKey:                string;
  role                  = new Role();
  ownerName             = '';
  managingRoleName      = '';
  teamName              = '';
}

@Component({
  selector: 'manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]
})
export class ManageRolesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$                            = new Subject();

  constructor(private roleService:                RoleService,
              private authService:                AuthService,
              private customerService:            CustomerService,
              private userService:                UserService,
              private teamService:                TeamService,
              private localDataService:           LocalDataService,
              public fuService:                   FormUtilitiesService<DisplayObject>,
              private confirmationDialogService:  ConfirmationDialogService,
              private selectRoleDialogService:    SelectRoleDialogService,
              private selectUserDialogService:    SelectUserDialogService,
              private selectTeamDialogService:    SelectTeamDialogService,
              private windowSizeService:          WindowSizeService,
              private fb:                         FormBuilder) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      name:               [],
      hasChecklists:      [],
      active:             []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {
      item.role.name                 = formGroup.controls['name'].value;
      item.role.hasChecklists        = formGroup.controls['hasChecklists'].value;
      item.role.active               = formGroup.controls['active'].value;
    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:               item.role.name,
        hasChecklists:      item.role.hasChecklists,
        active:             item.role.active,
        ownerName:          item.ownerName,
        managingRoleName:   item.managingRoleName,
        teamName:           item.teamName
      });
    };

    this.fuService.filterList = (filterString: string, list: DisplayObject[], filteredList: DisplayObject[]): DisplayObject[] => {

      return list.filter(
        displayObject => {
          return displayObject.role.name.toLowerCase().includes(filterString.toLowerCase()) ||
            displayObject.ownerName.toLowerCase().includes(filterString.toLowerCase());
        });

    };

  }

  ngOnInit() {

    this.authService.signInContext$
      .pipe(
        filter(signInContext => !!signInContext.administrator),
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => this.signInContext = signInContext);

    this.localDataService.roles$
      .pipe(
        flatMap(roles => this.updateDisplayObjects(roles)),
      )
      .subscribe(displayObjects => {
        this.fuService.items          = JSON.parse(JSON.stringify(displayObjects));
        this.fuService.filteredItems  = JSON.parse(JSON.stringify(displayObjects));

      });

    this.fuService.externalSave = () => { this.save(); };

    this.fuService.externalDelete = () => { this.delete(); };

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

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  updateDisplayObjects(roles: Role[]): Observable<DisplayObject[]> {

    return from(roles)
      .pipe(
        flatMap(role => this.createDisplayObjectFromRole(role)),
        toArray(),
        map(displayObjects => displayObjects.sort((a, b) => (a.role.name > b.role.name) ? 1 : -1))
      );

  }

  createDisplayObjectFromRole(role: Role): Observable<DisplayObject> {

    return new Observable<DisplayObject>(observer => {
      of(role)
        .pipe(
          // Create initial DisplayObject from role
          map(obj => {

            const displayObject               = new DisplayObject();

            displayObject.FSKey = role.FSKey;
            displayObject.role  = role;

            return displayObject;

          }),
          flatMap(displayObject => this.addOwnerNameToDisplayObject(displayObject, role)),
          flatMap(displayObject => this.addManagingRoleNameToDisplayObject(displayObject, role)),
          flatMap(displayObject => this.addTeamNameToDisplayObject(displayObject, role))
        )
        .subscribe(displayObject => {

          observer.next(displayObject);
          observer.complete();

        });
    });

  }

  save() {

    if (this.checkValidFormEntries().length > 0) {
      return;
    }

    const role = this.createNewRoleFromFormValues();

    if (this.fuService.pageState === this.fuService.pageStateOptions.ADD) {

      this.roleService.addRole(this.signInContext.customer.FSKey, role);

    } else {

      this.roleService.updateRole(this.signInContext.customer.FSKey, role);

    }

    this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

    this.fuService.cancel();

  }

  checkValidFormEntries(): string[] {

    this.fuService.errorMessages = [];

    if (!this.fuService.item.role.name.trim()) {
      this.fuService.errorMessages.push('Name field is required');
    }

    return this.fuService.errorMessages;

  }

  createNewRoleFromFormValues(): Role {

    const role = new Role();

    role.FSKey                  = this.fuService.item.role.FSKey;
    role.name                   = this.fuService.item.role.name;
    role.ownerFSKey             = this.fuService.item.role.ownerFSKey;
    role.managingRoleFSKey      = this.fuService.item.role.managingRoleFSKey;
    role.teamFSKey              = this.fuService.item.role.teamFSKey;
    role.hasChecklists          = this.fuService.item.role.hasChecklists;
    role.active                 = this.fuService.item.role.active;

    return role;

  }

  updateUserRoleFSKeys(customer: Customer, roleFSKey: string) {

    // Check if Role Owner has changed
    if (this.fuService.originalItem.role.ownerFSKey !== this.fuService.item.role.ownerFSKey) {

      // Remove Role from previous Owner - if one was set
      if (this.fuService.originalItem.role.ownerFSKey) {
        this.userService.removeRoleFromUser(this.signInContext, this.fuService.originalItem.role.ownerFSKey, roleFSKey);
      }

      // Add Role to new Owner - if one was set
      if (this.fuService.item.role.ownerFSKey) {
        this.userService.addRoleToUser(this.signInContext, this.fuService.item.role.ownerFSKey, roleFSKey);
      }

    }

  }

  addNew() {

    this.fuService.addNew(new DisplayObject());

  }

  close(role: Role) {

    this.fuService.cancel(role.FSKey !== this.fuService.item.role.FSKey);

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.role.FSKey !== this.fuService.item.role.FSKey);

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Confirm Delete ' + this.fuService.item.role.name)
      .then(confirmed => {

        if (confirmed) {

          this.roleService.deleteRole(this.signInContext.customer.FSKey, this.fuService.item.role.FSKey);

          this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

        }

      });

  }

  selectOwner() {

    this.selectUserDialogService.selectUser()
      .then(selectedUser => {

          if (selectedUser) {

            this.fuService.item.role.ownerFSKey = selectedUser.FSKey;

            this.fuService.item.ownerName = selectedUser.name;

            this.fuService.updateItemChanged();
          }
        }

      );

  }

  removeOwner() {

    this.confirmationDialogService.confirmSelection('Confirm Remove ' + this.fuService.item.ownerName)
      .then(confirmed => {

        if (confirmed) {

          this.fuService.item.role.ownerFSKey = '';

          this.fuService.item.ownerName = '';

          this.fuService.updateItemChanged();
        }

      });

  }

  selectManagingRole() {

    this.selectRoleDialogService.selectRole(false)
      .then(selectedRole => {

          if (selectedRole) {

            this.fuService.item.role.managingRoleFSKey = selectedRole.recipientFSKey;

            this.fuService.item.managingRoleName = selectedRole.recipientName;

            this.fuService.updateItemChanged();

          }

        }
      );

  }

  removeManagingRole() {

    this.confirmationDialogService.confirmSelection('Confirm Remove Managing Role')
      .then(confirmed => {

        if (confirmed) {

          this.fuService.item.role.managingRoleFSKey = '';

          this.fuService.item.managingRoleName = '';

          this.fuService.updateItemChanged();

        }

      });

  }

  selectTeam() {

    this.selectTeamDialogService.selectTeam()
      .then(selectedTeam => {

        if (selectedTeam) {

          this.fuService.item.role.teamFSKey = selectedTeam.FSKey;

          this.fuService.item.teamName = selectedTeam.name;

          this.fuService.updateItemChanged();

        }

      });

  }

  removeTeam() {

    this.confirmationDialogService.confirmSelection('Confirm Remove ' + this.fuService.item.teamName)
      .then(confirmed => {

        if (confirmed) {

          this.fuService.item.role.teamFSKey = '';

          this.fuService.item.teamName = '';

          this.fuService.updateItemChanged();

        }

      });

  }

  addOwnerNameToDisplayObject(initialDisplayObject: DisplayObject, role: Role): Observable<DisplayObject> {

    return of(initialDisplayObject)
      .pipe(
        flatMap(displayObject => {

          if (role.ownerFSKey) {

            return combineLatest([
              of(displayObject),
              this.userService.getUserFromFSKey(this.signInContext, role.ownerFSKey)
            ]);

          } else {

            return combineLatest([
              of(displayObject),
              of(undefined)]
            );

          }

        }),
        map(([displayObject, user]) => {

          if (user) {
            displayObject.ownerName = user.name;
          }

          return displayObject;

        })
      );


  }

  addManagingRoleNameToDisplayObject(initialDisplayObject: DisplayObject, role: Role): Observable<DisplayObject> {

    return of(initialDisplayObject)
      .pipe(
        flatMap(displayObject => {

          if (role.managingRoleFSKey) {

            return combineLatest([
              of(displayObject),
              this.roleService.getRoleFromFSKey(this.signInContext, role.managingRoleFSKey)
            ]);

          } else {

            return combineLatest([
              of(displayObject),
              of(undefined)
            ]);

          }
        }),
        map(([displayObject, managingRole]) => {

          displayObject.managingRoleName = managingRole ? managingRole.name : '';

          return displayObject;

        })
      );

  }

  addTeamNameToDisplayObject(initialDisplayObject: DisplayObject, role: Role): Observable<DisplayObject>  {

    return of(initialDisplayObject)
      .pipe(
        flatMap(displayObject => {

          if (role.teamFSKey) {

            return combineLatest([
              of(displayObject),
              this.teamService.getTeamFromFSKey(this.signInContext.customer.FSKey, role.teamFSKey)
            ]);

          } else {

            return combineLatest([
              of(displayObject),
              of(undefined)
            ]);

          }
        }),
        map(([displayObject, team]) => {

          displayObject.teamName = team ? team.name : '';

          return displayObject;

        })
      );

  }

}

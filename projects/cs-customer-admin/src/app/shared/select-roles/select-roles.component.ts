import { Component, EventEmitter, Input, OnDestroy, OnInit, Output }                                    from '@angular/core';
import { filter, first, flatMap, map, takeUntil, tap, toArray }                                         from 'rxjs/operators';
import { RoleService }                                                                                  from '../../model/services/role.service';
import { combineLatest, from, Observable, of, Subject }                                                 from 'rxjs';
import { SignInContext }                                                                                from '../../model/security/sign-in-context';
import { LocalDataService }                                                                             from '../../model/services/local-data.service';
import { Customer, Role, Team }                                                                         from 'cs-shared-components';

class DisplayObject {
  role                  = new Role();
  displayName:          string;
}

@Component({
  selector: 'select-roles',
  templateUrl: './select-roles.component.html',
  styleUrls: []
})
export class SelectRolesComponent implements OnInit, OnDestroy {
  @Input()  heading:                  string;
  @Input()  selectedRoles:            Role[];
  @Input()  teams:                    Team[];
  @Input()  includeTeams              = true;
  @Input()  signInContext:            SignInContext;
  @Output() changed                   = new EventEmitter<boolean>();
  @Output() updatedSelectedRoles      = new EventEmitter<Role[]>();
  editingRoles                        = false;                // User in template, set when User selects edit
  selectedDisplayObjects:             DisplayObject[] = [];   // DisplayObjects that relate to selectedRoles
  displayObjects:                     DisplayObject[] = [];   // Display objects that are available for User selection (not in selectedDisplayObjects)
  filteredDisplayObjects:             DisplayObject[] = [];   // Filtered list of displayObjects
  originalSelectedDisplayObjects:     DisplayObject[] = [];   // Used to check for changes
  selectedTab                         = 'Roles';
  customer:                           Customer;
  // customer$                           = new BehaviorSubject<Customer>(undefined);
  filter                              = '';                   // Value of filter entered by User
  destroy$                            = new Subject();


  constructor(private roleService:                      RoleService,
              private localDataService:                 LocalDataService) { }

  ngOnInit() {

    this.signInContext.localDataService.roles$
      .pipe(
        flatMap(roles => this.getDisplayObjects(roles, this.selectedRoles, this.includeTeams)),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.displayObjects = JSON.parse(JSON.stringify(result));
        this.filteredDisplayObjects = JSON.parse(JSON.stringify(result));
      });

    this.getDisplayObjectsFromRoles(this.selectedRoles)
      .pipe(
        first()
      )
      .subscribe(displayObjects => {
        this.selectedDisplayObjects = JSON.parse(JSON.stringify(displayObjects));
        this.originalSelectedDisplayObjects = JSON.parse(JSON.stringify(displayObjects));
      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  setSelectedTab(tab: string) {

    this.selectedTab = tab;

  }

  /**
   * Removes DisplayObject from selectedDisplayObjects
   */
  removeDisplayObject(displayObject: DisplayObject) {

    // Only allow removal when editingRoles
    if (!this.editingRoles) {
      return;
    }

    const index = this.selectedDisplayObjects.findIndex((obj: DisplayObject) => obj.role.FSKey === displayObject.role.FSKey);

    // Remove from selectedDisplayObjects
    this.selectedDisplayObjects.splice(index, 1);

    // Add back to displayObjects
    this.displayObjects.push(displayObject);

    // Reapply filter
    this.filterDisplayObjects();

    this.changed.emit(this.checkForChanges());

    this.updatedSelectedRoles.emit(this.getSelectedRolesFromDisplayObjects(this.selectedDisplayObjects));

  }

  /**
   * Adds DisplayObject to selectedDisplayObjects, if it is not already in selectedDisplayObjects
   */
  addDisplayObject(displayObject: DisplayObject) {

    if (this.selectedDisplayObjects.findIndex((obj: DisplayObject) => obj.role.FSKey === displayObject.role.FSKey) < 0) {

      this.selectedDisplayObjects.push(displayObject);

      // Remove from displayObjects
      const index = this.displayObjects.findIndex((obj: DisplayObject) => obj.role.FSKey === displayObject.role.FSKey);

      this.displayObjects.splice(index, 1);

      // Reapply filter
      this.filterDisplayObjects();

      this.changed.emit(this.checkForChanges());

      this.updatedSelectedRoles.emit(this.getSelectedRolesFromDisplayObjects(this.selectedDisplayObjects));

    }

  }

  addTeam(team: Team) {

    from(team.teamMemberRoleFSKeys)
      .pipe(
        flatMap(roleFSkey => this.roleService.getRoleFromFSKey(this.signInContext, roleFSkey)),
        toArray(),
        flatMap(roles => this.getDisplayObjectsFromRoles(roles))
      )
      .subscribe(displayObjects => {

        displayObjects.map(displayObject => {
          // Only add Roles that are not already in selectedDisplayObjects
          if (this.selectedDisplayObjects.findIndex((obj: DisplayObject) => obj.role.FSKey === displayObject.role.FSKey) < 0) {
            this.selectedDisplayObjects.push(displayObject);
          }
        });

        this.changed.emit(this.checkForChanges());

        this.updatedSelectedRoles.emit(this.getSelectedRolesFromDisplayObjects(this.selectedDisplayObjects));

      });


  }

  getDisplayObjectsFromRoles(roles: Role[]): Observable<DisplayObject[]> {

    return from(roles)
      .pipe(
        flatMap(role => this.createDisplayObjectFromRole(role)),
        toArray(),
        map(displayObjects => displayObjects.sort((obj1, obj2) => obj1.displayName > obj2.displayName ? 1 : -1))
      );

  }

  createDisplayObjectFromRole(role: Role): Observable<DisplayObject> {

    return  this.roleService.getDisplayNameForRole(role, this.localDataService.users$)
        .pipe(
          flatMap(displayName => {

            const displayObject = new DisplayObject();

            displayObject.role                = role;
            displayObject.displayName         = displayName;

            return of(displayObject);

          })
        );

  }

  getSelectedRolesFromDisplayObjects(displayObjects: DisplayObject[]): Role[] {

    const roles: Role[] = [];

    if (displayObjects) {

      displayObjects.map(displayObject => {

        const role: Role = displayObject.role;

        roles.push(role);
      });

    }

    return roles;

  }

  /**
   * Returns a list of DisplayObjects for roles and teams (if includeTeams)
   * Any entries already included in selectedRoles are NOT returned.
   */
  getDisplayObjects(
    roles:          Role[],
    selectedRoles:  Role[],
    includeTeams:   boolean): Observable<DisplayObject[]> {

    return from(roles)
      .pipe(
        filter(role => {
          if (selectedRoles) {
            // Only continue if role is not in selectedRoles
            return selectedRoles.findIndex(selected => selected.FSKey === role.FSKey) < 0;
          } else {
            // No selectedRoles so continue
            return false;
          }
        }),
        flatMap(role => combineLatest([
          of(role),
          this.roleService.getDisplayNameForRole(role, this.localDataService.users$).pipe(first())
          ])
        ),
        map(([role, displayName]) => {

          const result: DisplayObject[] = [];

          const roleDisplayObject = new DisplayObject();

          roleDisplayObject.role = role;
          roleDisplayObject.displayName       = displayName;

          result.push(roleDisplayObject);

          return result;
        }
      ),
      flatMap(result => from(result)),
      toArray()
      );

  }

  checkForChanges(): boolean {

    if (this.selectedDisplayObjects.length !== this.originalSelectedDisplayObjects.length) {
      // Different lengths so return true
      return true;
    }

    if (this.originalSelectedDisplayObjects.length !== 0) {
      let changed = false;

      this.originalSelectedDisplayObjects.map((displayObject, index) => {
        if (displayObject.role.FSKey !== this.selectedDisplayObjects[index].role.FSKey) {
          // Sequence is changed so return true
          changed = true;
        }
      });

      return changed;
    } else {
      // originalSelectedDisplayObjects is empty and was empty to start with
      return false;
    }

  }

  editRoles(edit: boolean) {
    this.editingRoles = edit;
  }

  filterDisplayObjects() {

    this.sortDisplayObjects(this.displayObjects);

    if (this.filter) {
      this.filteredDisplayObjects = this.displayObjects.filter(
        displayOject => {
          return displayOject.displayName.toLowerCase().includes(this.filter.toLowerCase());
        });
    } else {
      // filter not set so slap the whole lot in
      this.filteredDisplayObjects = JSON.parse(JSON.stringify(this.displayObjects));
    }

  }

  sortDisplayObjects(displayObjects: DisplayObject[]): DisplayObject[] {

    return displayObjects.sort((obj1, obj2) => {
      return obj1.displayName > obj2.displayName ? 1 : -1;
    });

  }

}

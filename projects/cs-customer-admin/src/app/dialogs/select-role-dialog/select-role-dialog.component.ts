import { Component, Inject, OnDestroy, OnInit }                                                         from '@angular/core';
import { AuthService }                                                                                  from '../../model/services/auth.service';
import { Observable, Subject }                                                                          from 'rxjs';
import { UserService }                                                                                  from '../../model/services/user.service';
import { switchMap, takeUntil, tap}                                                                     from 'rxjs/operators';
import { SignInContext }                                                                                from '../../model/security/sign-in-context';
import { WindowSize, WindowSizeService }                                                                from '../../model/services/window-size.service';
import { MAT_DIALOG_DATA, MatDialogRef }                                                                from '@angular/material/dialog';
import { Role }                                                                                         from 'cs-shared-components';

export class MessageRecipientDetails {
  recipientFSKey:   string;
  recipientName:    string;
}

class DisplayObject {
  ID:                   number; // Used to uniquely identify each DisplayObject
  recipientFSKey:       string;
  recipientName         = '';
}

@Component({
  selector: 'select-role-dialog',
  templateUrl: './select-role-dialog.component.html',
  styleUrls: []
})
export class SelectRoleDialogComponent implements OnInit, OnDestroy {
  signInContext:                    SignInContext;
  displayObject:                    DisplayObject;
  displayObjects:                   DisplayObject[];
  filteredDisplayObjects:           DisplayObject[];
  includeTeams:                     boolean;
  filter:                           string;
  windowSize$:                      Observable<WindowSize>;
  destroy$                          = new Subject();

  constructor(private selectRoleDialogComponent:    MatDialogRef<SelectRoleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private userService:                  UserService,
              private windowSizeService:            WindowSizeService,
              private authService:                  AuthService) { }

  ngOnInit() {

    this.windowSize$ = this.windowSizeService.windowSize$
      .pipe(
        takeUntil(this.destroy$)
      );

    this.includeTeams = this.data['includeTeams'];

    // Get signInContext
    const signInContext$ = this.authService.signInContext$
      .pipe(
        tap(signInContext => this.signInContext = signInContext),
        takeUntil(this.destroy$)
      );

    // Get Roles
    const roles$ = signInContext$
      .pipe(
        switchMap(signInContext => this.signInContext.localDataService.roles$)
      )
      .subscribe(roles => {
        this.filteredDisplayObjects = this.getDisplayObjects(roles);
        this.displayObjects         = this.getDisplayObjects(roles);
      });

  }

  getDisplayObjects(roles: Role[]): DisplayObject[] {

    const displayObjects: DisplayObject[] = [];

    roles.map(role => {

      const displayObject = new DisplayObject();
      displayObject.ID              = displayObjects.length;
      displayObject.recipientFSKey  = role.FSKey;

      this.getRoleAndOwnerDisplayName(role)
        .then(name => displayObject.recipientName = name);

      displayObjects.push(displayObject);

      // If role hasTeam then add Team to displayObjects
      if (this.includeTeams && !!role.teamFSKey) {
        const teamDisplayObject           = new DisplayObject();
        teamDisplayObject.ID              = displayObjects.length;
        teamDisplayObject.recipientFSKey  = role.FSKey;
        teamDisplayObject.recipientName   = role.teamFSKey;
        displayObjects.push(teamDisplayObject);
      }

    });

    return displayObjects;

  }

  async getRoleAndOwnerDisplayName(role: Role) {

    let result: string;

    await this.userService.getUserFromFSKey(this.signInContext, role.ownerFSKey)
      .subscribe(user => result = role.name? role.name: '' + ' (' + user.name + ')');

    return result;

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  select() {

    this.selectRoleDialogComponent.close({
      recipientFSKey: this.displayObject.recipientFSKey,
      recipientName:  this.displayObject.recipientName
    });

  }

  cancel() {

    this.selectRoleDialogComponent.close(null);

  }

  onClick(displayObject: DisplayObject) {

    this.displayObject = displayObject;

  }

  filterList() {

    this.filteredDisplayObjects = this.displayObjects.filter(
      displayOject => {
        return displayOject.recipientName.toLowerCase().includes(this.filter.toLowerCase());
      });

  }


}

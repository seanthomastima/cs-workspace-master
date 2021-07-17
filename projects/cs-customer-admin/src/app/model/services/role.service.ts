import { Injectable }                                                                                   from '@angular/core';
import { from, Observable }                                                                             from 'rxjs';
import { first, flatMap, map, toArray, filter }                                                         from 'rxjs/operators';
import { SignInContext }                                                                                from '../security/sign-in-context';
import { AngularFirestore }                                                                             from '@angular/fire/firestore';
import { FirestoreUtilsService, MessageDialogService }                                                  from 'shared-components';
import { Role, SelectUserRoleDialogService, User }                                                      from 'cs-shared-components';
import { FS }                                                                                           from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private afs:                              AngularFirestore,
              private selectUserRoleDialogService:      SelectUserRoleDialogService,
              private fireStoreUtils:                   FirestoreUtilsService,
              private messageDialogService:             MessageDialogService) { }

  getRolesFIRESTORE(customerFSKey: string): Observable<Role[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Roles}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(roles => Role.fromJsonList(roles))
      );

  }

  /**
   * Returns the Role for the provided userFSKey.
   * If there is more than one Role for the User then the User is requested to select a Role
   */
  getOwningRole(signInContext: SignInContext, userFSKey: string): Observable<Role> {

    return new Observable(observer => {

      this.getRolesForUser(signInContext, userFSKey)
        .pipe(
          map((roles: Role[]) => roles.filter(role => role.hasChecklists))
        )
        .subscribe(roles => {

          if (roles.length === 1) {

            observer.next(roles[0]);
            observer.complete();

          } else if (roles.length === 0) {

            this.messageDialogService.displayMessage('The signed in User has no Roles assigned')
              .then( () => {

                observer.next(undefined);
                observer.complete();

              });

          } else {

            this.selectUserRoleDialogService.selectRole(roles)
              .then(role => {
                if (role) {
                  observer.next(role);
                  observer.complete();
                }
              });

          }
        });

    });

  }

  getRolesForUser(
    signInContext:  SignInContext,
    userFSKey:      string): Observable<Role[]> {

    return signInContext.localDataService.roles$
      .pipe(
        map(roles => roles.filter(role => role.ownerFSKey === userFSKey))
      );

  }

  getRoleFromFSKey(
    signInContext:    SignInContext,
    FSKey:            string): Observable<Role> {

    return signInContext.localDataService.roles$
      .pipe(
        first(),
        map(roles => {
          return {
            roles,
            index: roles.findIndex(role => role.FSKey === FSKey)
          };
        }),
        map(obj => obj.roles[obj.index])
      );

  }

  /**
   * Returns valid Roles
   * If an FSKey does not return a Role then it is filtered out.
   */
  getRolesFromFSKeys(
    signInContext:    SignInContext,
    FSKeys:            string[]): Observable<Role[]> {

    return from(FSKeys)
      .pipe(
        flatMap(FSKey => this.getRoleFromFSKey(signInContext, FSKey)),
        filter(role => !!role),
        toArray()
      );

  }

  getReportingRoles(
    signInContext:  SignInContext,
    roleFSKey:      string): Observable<Role[]> {

    return signInContext.localDataService.roles$
      .pipe(
        map(roles => roles.filter(role => role.managingRoleFSKey === roleFSKey))
      );

  }

  addRole(
    customerFSKey:  string,
    role:           Role) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Roles}`;

    const docName = this.fireStoreUtils.docName();

    role.FSKey = docName;

    this.fireStoreUtils.addToCollection(this.afs, path, docName, role);

  }

  updateRole(
    customerFSKey:  string,
    role:           Role) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Roles}`;

    this.fireStoreUtils.update(this.afs, path, role.FSKey, role);

  }

  deleteRole(
    customerFSKey:  string,
    roleFSKey:      string) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Roles}/${roleFSKey}`;

    this.fireStoreUtils.delete(this.afs, path);

  }

  getDisplayNameForRole(
    role:           Role,
    users$:         Observable<User[]>): Observable<string> {

    return users$
      .pipe(
        map(users => users.filter(user => user.FSKey === role.ownerFSKey)),
        map(users => users[0]),
        map(user => {

          if (!!user) {

            return role.name + ' (' + user.name + ')';

          } else {

            return role.name + ' (No Owner)';

          }

        }),
        first()
      );

  }

}

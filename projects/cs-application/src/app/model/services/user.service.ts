import { Injectable }                                                                               from '@angular/core';
import { AngularFirestore }                                                                         from '@angular/fire/firestore';
import { FS }                                                                                       from '../firestore-constants';
import { first, map, tap }                                                                          from 'rxjs/operators';
import { Observable, combineLatest, from }                                                          from 'rxjs';
import { AngularFireAuth }                                                                          from '@angular/fire/auth';
import { AngularFireFunctions }                                                                     from '@angular/fire/functions';
import { SignInContext }                                                                            from '../security/sign-in-context';
import { FirestoreUtilsService }                                                                    from 'shared-components';
import { User }                                                                                     from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afFunctions:                  AngularFireFunctions,
              private afAuth:                       AngularFireAuth,
              private afs:                          AngularFirestore,
              private fireStoreUtils:               FirestoreUtilsService) { }

  getUsersFIRESTORE(customerFSKey: string): Observable<User[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(User.fromJsonList)
      );

  }

  addUser(customerFSKey: string, UID: string, user) {

    const FSKey: {} = {FSKey: UID};

    user = {...FSKey, ...user};

    delete user.password;

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    return this.fireStoreUtils.addToCollection(this.afs, path, user.FSKey, user);

  }

  updateUser(customerFSKey: string, user: User) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    this.fireStoreUtils.update(this.afs, path, user.FSKey, user);

  }

  /**
   * Returns true if the emailAddress is associated with a Google Authenticated User, returns false if not.
   */
  userHasSignIn(emailAddress: string): Observable<string> {

    const callable = this.afFunctions.httpsCallable('userHasSignIn');

    return from(callable({emailAddress}))
      .pipe(
        first(),
        map(result => {
          if (!!result.UID) {
            return result.UID;
          } else {
            return '';
          }
        })
      );

  }

  /**
   * When a User is deleted the Google Authenticated User is not automatically deleted.
   * First a check is made with this method whether the User has another valid sign in option. For example as an Administrator, or with
   * another Customer.
   * If no other valid sign in option is found then the Google Authenticated User can be deleted also.
   *
   * This method returns true if the userFSKey is associated with a sign in option and false if not.
   */
  userHasValidSignInOption(userFSKey: string): Observable<boolean> {

    // Is SuperAdministrator
    const isSuperAdministrator$ = this.afs.doc(`${FS.SuperAdministrators}/${userFSKey}`)
      .valueChanges()
      .pipe(
        map(superAdministrator => !!superAdministrator)
      );

    // Is Administrator
    const isAdministrator$ = this.afs.collectionGroup('administrators',
      ref => ref.where('FSKey', '==', userFSKey)
    )
      .valueChanges()
      .pipe(
        map(administrators => administrators.length > 0)
      );

    // Is User
    const isUser$ = this.afs.collectionGroup('users',
      ref => ref.where('FSKey', '==', userFSKey)
    )
      .valueChanges()
      .pipe(
        map(users => users.length > 0)
      );

    return combineLatest([isSuperAdministrator$, isAdministrator$, isUser$])
      .pipe(
        tap(console.log),
        map(([isSuperAdministrator, isAdministrator, isUser]) => isSuperAdministrator || isAdministrator || isUser)
      );

  }

  /**
   * This method deletes the Google Authenticated User using the UID (in userFSKey)
   *
   * This method returns true if the delete was successful and false if an Error was encountered
   */
  deleteSignInUser(userFSKey: string): Observable<boolean> {

    const callable = this.afFunctions.httpsCallable('deleteSignInUser');

    return from(callable({FSKey: userFSKey}))
      .pipe(
        map(result => {

          if (!!result.Error) {
            return true;
          } else {
            return false;
          }
        })
      );

  }

  /**
   * Creates a new Google Authenticated User
   *
   * user parameter must contain the fields: emailAddress; password; name
   */
  addSignInUser(user): Observable<string>{

    const callable = this.afFunctions.httpsCallable('addSignInUser');

    return from (callable({...user}))
      .pipe(
        map(result => {

          if (!!result.Error) {
            return 'Error';
          } else {
            return result.UID;
          }

        })
      );
  }

  getUserFromFSKeyFIRESTORE(
    customerFSKey:  string,
    FSKey:          string): Observable<User> {

    return this.getUsersFIRESTORE(customerFSKey)
      .pipe(
        first(),
        map(users => {

          return {
            users,
            index: users.findIndex(user => user.FSKey === FSKey)
          };

        }),
        map(obj => obj.users[obj.index])
      );

  }

  getUserFromFSKey(
    signInContext: SignInContext,
    FSKey: string): Observable<User> {

    return signInContext.localDataService.users$
      .pipe(
        first(),
        map(users => {

          return {
            users,
            index: users.findIndex(user => user.FSKey === FSKey)
          };

        }),
        map(obj => obj.users[obj.index])
      );

  }

  addRoleToUser(
    signInContext:  SignInContext,
    userFSKey:      string,
    roleFSKey:      string) {

    this.getUserFromFSKey(signInContext, userFSKey)
      .pipe(
        first()
      )
      .subscribe(user => {

        if (user && !user.roleFSKeys.includes(roleFSKey)) {

          user.roleFSKeys.push(roleFSKey);

          this.updateUser(signInContext.customer.FSKey, user);

        }

      });

  }

  removeRoleFromUser(
    signInContext:  SignInContext,
    userFSKey:      string,
    roleFSKey:      string) {

    this.getUserFromFSKey(signInContext, userFSKey)
      .pipe(
        first()
      )
      .subscribe(user => {

        if (user && user.roleFSKeys.includes(roleFSKey)) {

          const index = user.roleFSKeys.findIndex(FSKey => FSKey === roleFSKey);

          user.roleFSKeys.splice(index, 1);

          this.updateUser(signInContext.customer.FSKey, user);

        }

      });

  }

}

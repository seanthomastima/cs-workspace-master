import {ChangeDetectorRef, Injectable} from '@angular/core';
import { AngularFirestore }                                                                         from '@angular/fire/firestore';
import {first, flatMap, map, switchMap, tap} from 'rxjs/operators';
import {Observable, combineLatest, from, of, Subject, BehaviorSubject} from 'rxjs';
import { AngularFireAuth }                                                                          from '@angular/fire/auth';
import { AngularFireFunctions }                                                                     from '@angular/fire/functions';
import { SignInContext }                                                                            from '../security/sign-in-context';
import { FirestoreUtilsService }                                                                    from 'shared-components';
import { User }                                                                                     from 'cs-shared-components';
import { FS }                                                                                       from '../../../../../shared-files/firestore-constants';

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

  addUser(
    customerFSKey:  string,
    UID:            string,
    user): Observable<string> {

    const FSKey: {} = {FSKey: UID};

    user = {...FSKey, ...user};

    // Remove password so it is not stored in database
    delete user.password;

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    return from(this.fireStoreUtils.addToCollection(this.afs, path, user.FSKey, user))
      .pipe(
        map(() => UID)
      );

  }

  updateUser(
    customerFSKey:  string,
    user:           User) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    this.fireStoreUtils.update(this.afs, path, user.FSKey, user);

  }

  /**
   * Returns the UID related to emailAddress if the emailAddress is associated with a Google Authenticated User, returns '' if not.
   */
  getUIDFromEmailAddress(emailAddress: string): Observable<string> {

    const callable = this.afFunctions.httpsCallable('userHasSignIn');

    return from(callable({emailAddress}))
      .pipe(
        first(),
        map(result => result.UID)
      );

  }

  getAuthUserDetailsFromUID(UID: string): Observable<{
    UID: string,
    name: string,
    emailAddress: string
  }> {

    const callable = this.afFunctions.httpsCallable('getAuthUserDetailsFromUID');

    return from(callable({UID}))
      .pipe(
        first(),
      );

  }

  getOrCreateGoogleAuthenticatedUser(
    customerFSKey:              string,
    emailAddress:               string,
    messages:                   string[],
    displayNamePasswordForm$:   BehaviorSubject<boolean>,
    namePasswordForm$:          Subject<{name: string; password: string}>,
    changeDetectorRef:          ChangeDetectorRef): Observable<[{ UID: string, name: string, emailAddress: string }, boolean, string]> {

    const userUID$ = this.getUIDFromEmailAddress(emailAddress);

    const authUserDetails$ = userUID$
      .pipe(
        switchMap(UID => this.getAuthUserDetailsFromUID(UID))
      );

    const isCustomerUser$ = this.getEmailAddressIsCustomerUser(emailAddress, customerFSKey);

    // Create user to add data to as it is created
    const user            = new User();
    user.emailAddress     = emailAddress;
    user.customerFSKey    = customerFSKey;

    return combineLatest([authUserDetails$, isCustomerUser$])
      .pipe(
        flatMap(([authUserDetails, isCustomerUser]) => {

          // Check if emailAddress is associated with Google Authenticated User
          if (!authUserDetails.UID) {

            messages.push('Google Authenticated User is being created for: ' + emailAddress);

            // Display form to enter name and password
            displayNamePasswordForm$.next(true);  // namePasswordForm$ will complete once form is closed

            changeDetectorRef.detectChanges(); // Necessary to trigger update of template

            return combineLatest([
              namePasswordForm$
                .pipe(
                  flatMap((dialogResult) => {

                      const authenticatedUser = {
                        emailAddress,
                        name:         dialogResult.name,
                        password:     dialogResult.password
                      }

                      user.name = dialogResult.name;
                      changeDetectorRef.detectChanges();

                      // Creating Google Authenticated User
                      return this.addSignInUser(authenticatedUser)

                    }
                  ),
                  flatMap(UID => {

                      console.log('UID', UID);

                      if (UID === '') {
                        messages.push('Error: Could not create Google Authenticated User');
                        changeDetectorRef.detectChanges(); // Necessary to trigger update of template
                      }

                      return this.getAuthUserDetailsFromUID(UID);

                    }
                  )
                ),
              of(isCustomerUser),
              of(customerFSKey)
            ])

          } else {

            messages.push('Google Authenticated User was found for: ' + emailAddress);
            changeDetectorRef.detectChanges(); // Necessary to trigger update of template

            return combineLatest([
              of(authUserDetails),
              of(isCustomerUser),
              of(customerFSKey)
            ])

          }

        })
      )

  }

  getEmailAddressIsCustomerUser(emailAddress: string, customerFSKey: string): Observable<boolean> {

    const callable = this.afFunctions.httpsCallable('customerHasUser');

    return callable({emailAddress, customerFSKey})
      .pipe(
        first(),
        map(res => res.hasUser)
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
            return false;
          } else {
            return true;
          }
        })
      );

  }

  /**
   * Creates a new Google Authenticated User
   *
   * user parameter must contain the fields: emailAddress; password; name
   *
   * Returns UID if successful
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

  getUserFromFSKey(
    signInContext:  SignInContext,
    FSKey:          string): Observable<User> {

    return signInContext.localDataService.users$
      .pipe(
        first(),
        map(users => {

          const index = users.findIndex(user => user.FSKey === FSKey);

          return users[index];

        }),
        map(User.fromJson)
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

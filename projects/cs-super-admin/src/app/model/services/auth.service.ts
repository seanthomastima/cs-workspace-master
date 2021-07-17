import { Injectable }                                                                               from '@angular/core';
import { AngularFireAuth }                                                                          from '@angular/fire/auth';
import { BehaviorSubject }                                                                          from 'rxjs';
import { SignInContext }                                                                            from '../security/sign-in-context';
import { Administrator }                                                                            from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private signInContext       = new BehaviorSubject<SignInContext>(new SignInContext(undefined));
  signInContext$              = this.signInContext.asObservable();

  constructor(private afAuth:               AngularFireAuth) {

    this.updateSignInContext();

  }

  signIn(email: string, password: string) {

    return this.afAuth.signInWithEmailAndPassword(email, password);

  }

  signOut() {

    this.afAuth.signOut()
      .then(() => {
        console.log('signed out');
      });

  }

  updatePassword(newPassWord: string) {

    if (this.afAuth.currentUser) {

      return this.afAuth.currentUser
        .then(user => user.updatePassword(newPassWord));

    }

  }

  pushSignInContext(administrator: Administrator) {

    this.signInContext.next(new SignInContext(administrator));

  }

  /**
   * Private methods
   */

  private updateSignInContext() {

    // authState only fires on signIn and signOut
    this.afAuth.authState.subscribe(
      authUser => {

        if (authUser) {

          const admin = new Administrator();
          admin.FSKey = authUser.uid;
          admin.name = authUser.displayName;
          admin.emailAddress = authUser.email;

          this.signInContext.next(new SignInContext(admin));

        } else {

          this.signInContext.next(new SignInContext(undefined));

        }
      });

  }
}

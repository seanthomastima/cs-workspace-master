import { Injectable }                                                                               from '@angular/core';
import { BehaviorSubject, combineLatest, from, Observable, of }                                     from 'rxjs';
import { SignInContext }                                                                            from '../security/sign-in-context';
import { AngularFireAuth }                                                                          from '@angular/fire/auth';
import { LocalDataService }                                                                         from './local-data.service';
import { Customer, User }                                                                           from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private signInContext       = new BehaviorSubject<SignInContext>(new SignInContext(undefined, undefined));
  signInContext$              = this.signInContext.asObservable();

  constructor(private afAuth:               AngularFireAuth) {
  }

  signIn(email: string, password: string): Observable<any> {

    return from(this.afAuth.auth.signInWithEmailAndPassword(email, password));

  }

  signOut() {

    this.afAuth.auth.signOut()
      .then(() => {
        this.signInContext.next(new SignInContext(undefined, undefined));
        console.log('signed out');
      });

  }

  updatePassword(newPassWord: string) {

    if (this.afAuth.auth.currentUser) {
      return this.afAuth.auth.currentUser.updatePassword(newPassWord);
    }

  }

  updateEmailAddress(newEmailAddress: string) {

    if (this.afAuth.auth.currentUser) {
      return this.afAuth.auth.currentUser.updateEmail(newEmailAddress);
    }

  }

  updateDisplayName(newDisplayName: string) {

    if (this.afAuth.auth.currentUser) {
      return this.afAuth.auth.currentUser.updateProfile({displayName: newDisplayName});
    }

  }

  pushSignInContext(
    customer:         Customer,
    user:             User,
    localDataService: LocalDataService) {

    this.signInContext.next(new SignInContext(customer, user, localDataService));

  }

}

import { Injectable }                                                                               from '@angular/core';
import { BehaviorSubject, from, Observable, of }                                                    from 'rxjs';
import { SignInContext }                                                                            from '../security/sign-in-context';
import { AngularFireAuth }                                                                          from '@angular/fire/auth';
import { CustomerService }                                                                          from './customer.service';
import { LocalDataService }                                                                         from './local-data.service';
import { Administrator, Customer }                                                                  from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private signInContext       = new BehaviorSubject<SignInContext>(new SignInContext(undefined, undefined));
  signInContext$              = this.signInContext.asObservable();

  constructor(private afAuth:               AngularFireAuth,
              private customerService:      CustomerService) {
  }

  signIn(email: string, password: string): Observable<any> {

    return from(this.afAuth.signInWithEmailAndPassword(email, password));

  }

  signOut() {

    this.afAuth.signOut()
      .then(() => {
        this.signInContext.next(new SignInContext(undefined, undefined));
      });

  }

  updatePassword(newPassWord: string) {

    this.afAuth.currentUser
      .then(user => {
        user.updatePassword(newPassWord)
      });

  }

  pushSignInContext(
    customer:           Customer,
    administrator:      Administrator,
    localDataService:   LocalDataService) {

    this.signInContext.next(new SignInContext(customer, administrator, localDataService));

  }

}

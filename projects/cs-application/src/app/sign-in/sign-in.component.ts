import { Component, ElementRef, ViewChild }                                                             from '@angular/core';
import { AuthService }                                                                                  from '../model/services/auth.service';
import { Router }                                                                                       from '@angular/router';
import { filter, switchMap, tap }                                                                       from 'rxjs/operators';
import { CustomersService }                                                                             from '../model/services/customers.service';
import { combineLatest, of }                                                                            from 'rxjs';
import { UserService }                                                                                  from '../model/services/user.service';
import { LocalDataService }                                                                             from '../model/services/local-data.service';
import { FormUtilitiesService }                                                                         from 'form-utilities';

@Component({
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]
})
export class SignInComponent {
  @ViewChild('main') mainDiv:         ElementRef;
  customerSignInKey           = '';   // Linked to form
  emailAddress                = '';   // Linked to form
  password                    = '';   // Linked to form

  constructor(public fuService:                     FormUtilitiesService<undefined>,
              private authService:                  AuthService,
              private localDataService:             LocalDataService,
              private userService:                  UserService,
              private customerService:              CustomersService,
              private router:                       Router) {
  }

  signIn() {

    this.fuService.errorMessages = [];

    this.trimInputFields();

    if (!this.customerSignInKey) {
      this.fuService.errorMessages.push('Customer Sign In Key is required');
      return;
    }

    if (!this.emailAddress || ! this.password) {
      this.fuService.errorMessages.push('Both Email Address and Password are required');
      return;
    }

    this.authService.signIn(this.emailAddress, this.password)
      .pipe(
        switchMap(authUser => combineLatest([
          of(authUser.user),
          this.customerService.getCustomerFromSignInKey(this.customerSignInKey)
        ])),
        tap(([user, customer]) => {

          if (customer === undefined) {
            this.fuService.errorMessages.push('Sign in failed');
          }

        }),
        filter(([user, customer]) => !!customer),
        switchMap(([user, customer]) => combineLatest([
          this.userService.getUserFromFSKeyFIRESTORE(customer.FSKey, user.uid),
          of(customer)
        ]))
      )
      .subscribe(([user, customer]) => {

          if (!!user && !!customer) {

            this.authService.pushSignInContext(customer, user, this.localDataService);

            this.router.navigate(['/home']);

          } else {

            this.fuService.errorMessages.push('Sign in failed');
            this.authService.signOut();

          }

        },
        err => {
          this.fuService.errorMessages.push(`${err.message}`);
        }
      );

  }

  trimInputFields() {

    this.customerSignInKey  = this.customerSignInKey.trim();
    this.emailAddress       = this.emailAddress.trim();
    this.password           = this.password.trim();

  }

}

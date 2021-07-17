import { Component, ElementRef, ViewChild }                                                             from '@angular/core';
import { AuthService }                                                                                  from '../model/services/auth.service';
import { Router }                                                                                       from '@angular/router';
import { switchMap, tap}                                                                                from 'rxjs/operators';
import { CustomerService }                                                                              from '../model/services/customer.service';
import { combineLatest, of }                                                                            from 'rxjs';
import { LocalDataService }                                                                             from '../model/services/local-data.service';
import { FormUtilitiesService }                                                                         from 'form-utilities';
import { Administrator }                                                                                from 'cs-shared-components';

@Component({
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: []
})
export class SignInComponent {
  @ViewChild('main') mainDiv:         ElementRef;
  customerSignInKey           = '';   // Linked to form
  emailAddress                = '';   // Linked to form
  password                    = '';   // Linked to form

  constructor(public fuService:                     FormUtilitiesService<undefined>,
              private authService:                  AuthService,
              private localDataService:             LocalDataService,
              private customerService:              CustomerService,
              private router:                       Router) { }

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
        switchMap(user => combineLatest([
          of(user.user),
          this.customerService.getCustomerFromSignInKey(this.customerSignInKey)
        ])),
        switchMap(([user, customer]) => combineLatest([
          of(user),
          of(customer),
          this.customerService.userIsCustomerAdministrator(customer.FSKey, user.uid)
        ]))
      )
      .subscribe(([user, customer, isAdministrator]) => {

          if (customer && isAdministrator) {

            const administrator = new Administrator();
            administrator.FSKey           = user.uid;
            administrator.name            = user.displayName;
            administrator.emailAddress    = user.email;

            this.authService.pushSignInContext(customer, administrator, this.localDataService);

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

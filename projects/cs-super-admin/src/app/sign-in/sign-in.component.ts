import { Component, ElementRef, ViewChild }                                                             from '@angular/core';
import { AuthService }                                                                                  from '../model/services/auth.service';
import { Router }                                                                                       from '@angular/router';
import { FormUtilitiesService }                                                                         from 'form-utilities';
import { LocalDataService }                                                                             from '../model/services/local-data.service';
import { Administrator }                                                                                from 'cs-shared-components';
import { UtilitiesService }                                                                             from 'shared-components';
import { first, tap }                                                                                   from 'rxjs/operators';

@Component({
  selector: 'sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: []
})
export class SignInComponent {
  emailAddress                = '';   // Linked to form
  password                    = '';   // Linked to form

  constructor(public fuService:                     FormUtilitiesService<undefined>,
              private authService:                  AuthService,
              private localDataService:             LocalDataService,
              private utilitiesService:             UtilitiesService,
              private router:                       Router) { }

  signIn() {

    this.fuService.errorMessages = [];

    this.trimInputFields();

    // Verify that emailAddress and password fields are completed
    if (!this.emailAddress || ! this.password) {

      this.fuService.errorMessages.push('Both Email Address and Password are required');

      return;

    }

    // Verify that emailAddress belongs to a SuperAdministrator
    this.localDataService.superAdministrators$
      .pipe(
        first()
    )
      .subscribe((superAdministrators: Administrator[]) => {

        if (this.utilitiesService.isKeyAndValueInArray('emailAddress', this.emailAddress, superAdministrators) !== true) {

          this.fuService.errorMessages.push('Email address is not associated with a Super Administrator account');

        } else {

          this.signInWithAuthService(this.emailAddress, this.password);

        }

      });

  }

  updatePassword(event) {

    if (event) {

      this.password = event.value;

    }

  }

  updateEmailAddress(event) {

    if (event) {

      this.emailAddress = event.value;

    }

  }

  signInWithAuthService(emailAddress: string, password: string) {

    this.authService.signIn(emailAddress, password)
      .then(res => {

          this.router.navigate(['/home']);

        },
        err => {

          this.fuService.errorMessages.push(`${err.message}`);

        }
      );

  }

  trimInputFields() {

    this.emailAddress       = this.emailAddress.trim();
    this.password           = this.password.trim();

  }

}

import { Component, ElementRef, OnDestroy, OnInit }                                               from '@angular/core';
import { ScFormControls, UtilitiesService }                                                       from 'shared-components';
import { AngularFireFunctions }                                                                   from '@angular/fire/functions';
import { AuthService }                                                                            from '../model/services/auth.service';
import { MatSnackBar }                                                                            from '@angular/material/snack-bar';
import {finalize, first, takeUntil} from 'rxjs/operators';
import { SignInContext }                                                                          from '../model/security/sign-in-context';
import { Subject }                                                                                from 'rxjs';
import { ControlValueChange }                                                                     from 'form-utilities';
import { Administrator }                                                                          from 'cs-shared-components';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit, OnDestroy {

  signInContext:                      SignInContext;
  displayMode                         = 'PROFILE';  // PROFILE | PASSWORD
  formControlsProfile:                Partial<ScFormControls>[] =[];
  formControlsPassword:               Partial<ScFormControls>[] =[];
  formChanged                         =  false;
  waiting                             = false;
  errorMessages:                      string[] = [];
  destroy$                            = new Subject();

  constructor(private elementRef:                   ElementRef,
              private afFunctions:                  AngularFireFunctions,
              private authService:                  AuthService,
              private utilitiesService:             UtilitiesService,
              private snackBar:                     MatSnackBar) { }

  ngOnInit() {

    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => {

        this.signInContext = signInContext;

        if (this.signInContext.administrator) {

          this.initialiseFormControls();

        }

      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  setDisplayMode(mode: string) {

    this.displayMode = mode;

  }

  initialiseFormControls() {

    // Reset formControls
    this.formControlsProfile  = [];
    this.formControlsPassword = [];

    // Add Profile controls
    this.formControlsProfile.push({
      label:          'Name',
      name:           'name',
      controlType:    'input',
      value:          this.signInContext.administrator.name
    });

    this.formControlsProfile.push({
      label:          'Email address',
      name:           'emailAddress',
      controlType:    'email',
      value:          this.signInContext.administrator.emailAddress
    });

    // Add Password controls
    this.formControlsPassword.push({
      label:          'Password',
      name:           'password1',
      controlType:    'password',
      value:          ''
    });

    this.formControlsPassword.push({
      label:          'Password',
      name:           'password2',
      controlType:    'password',
      value:          ''
    });

  }

  saveProfile = (changes: ControlValueChange) => {

    this.errorMessages = [];

    this.updateProfile(changes);

  };

  savePassword = (changes: any) => {

    this.errorMessages = [];

    this.updatePassword(changes);

  }

  updateProfile(changes: ControlValueChange) {

    // Get updated values from changes
    const newName         = this.utilitiesService.isKeyAndValueInArray('name', 'name', changes) ?
                            this.utilitiesService.getPropertyForKeyAndValueInArray('name', 'name', 'value', changes) :
                            this.signInContext.administrator.name;

    const newEmailAddress = this.utilitiesService.isKeyAndValueInArray('name', 'emailAddress', changes) ?
                            this.utilitiesService.getPropertyForKeyAndValueInArray('name', 'emailAddress','value',  changes) :
                            this.signInContext.administrator.emailAddress;

    if (!this.validProfileEntries(newName, newEmailAddress)) {
      return;
    }

    this.waiting = true;

    // Create Administrator and add updated values
    const admin         = new Administrator();
    admin.FSKey         = this.signInContext.administrator.FSKey;
    admin.name          =  newName;
    admin.emailAddress  = newEmailAddress;

    // Call CloudFunction
    const callable = this.afFunctions.httpsCallable('updateSuperAdministrator');

    callable(Object.assign({}, admin))
      .pipe(
        finalize(() => this.waiting = false)
      )
      .subscribe((result) => {

        this.snackBar.open('Profile updated.', '', {
          duration: 3000
        });

        this.authService.pushSignInContext(admin);

        this.formChanged = false;

        console.log(result);

      });

  }

  updatePassword(changes: ControlValueChange) {

    const password1 = this.utilitiesService.getPropertyForKeyAndValueInArray('name', 'password1', 'value', changes);
    const password2 = this.utilitiesService.getPropertyForKeyAndValueInArray('name', 'password2', 'value', changes);

    if (!this.validPasswordEntries(password1, password2)) {
      return;
    }

    this.waiting = true;

    this.authService.updatePassword(password1)
      .then(() => {

        this.snackBar.open('Password updated.', '', {
          duration: 3000
        });

        this.initialiseFormControls();

      })
      .finally(() => this.waiting = false)
      .catch(err => this.errorMessages.push(err.message));

  }

  cancelProfile = () => {

    this.initialiseFormControls();

  }

  cancelPassword = () => {

    this.initialiseFormControls();

  }

  setFormChanged(event) {

    this.errorMessages = [];

    setTimeout(() => {

      this.formChanged = event;

    });

  }

  validProfileEntries(name: string, emailAddress: string): boolean {

    let result = true;

    // Check Passwords
    if (!name || !emailAddress) {

      result = false;

      this.errorMessages.push('Name and email address are required');

    }

    return result;

  }

  validPasswordEntries(password1: string, password2: string): boolean {

    let result = true;

    // Check Passwords
    if (!password1 || !password2 || password1.trim().length < 6) {

      result = false;

      this.errorMessages.push('Password field cannot be empty and must be at least six characters');

    } else {
      if (password1.trim() !== password2.trim()) {

        result = false;

        this.errorMessages.push('Passwords do not match');

      }
    }

    return result;

  }

}

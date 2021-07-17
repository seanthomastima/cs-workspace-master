import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                             from '@angular/core';
import { Subject }                                                                                        from 'rxjs';
import { finalize, takeUntil }                                                                            from 'rxjs/operators';
import { AuthService }                                                                                    from '../model/services/auth.service';
import { SignInContext }                                                                                  from '../model/security/sign-in-context';
import { AngularFireFunctions }                                                                           from '@angular/fire/functions';
import { MatSnackBar }                                                                                    from '@angular/material/snack-bar';
import clone                                                                                              from 'lodash/clone';
import { FormBuilder, FormGroup }                                                                         from '@angular/forms';
import { UserService }                                                                                    from '../model/services/user.service';
import { LocalDataService }                                                                               from '../model/services/local-data.service';
import { MessageDialogService, WindowSizeService }                                                        from 'shared-components';
import { FormUtilitiesSingleService }                                                                     from 'form-utilities';
import { User }                                                                                           from 'cs-shared-components';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: [],
  providers: [FormUtilitiesSingleService]
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  updatingPassword                    = false; // Displays UpdatePassword component when true
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$                            = new Subject();

  constructor(private elementRef:                   ElementRef,
              private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesSingleService<User>,
              private fb:                           FormBuilder,
              private authService:                  AuthService,
              private localDataService:             LocalDataService,
              private userService:                  UserService,
              private messageDialogService:         MessageDialogService,
              private snackBar:                     MatSnackBar,
              private windowSizeService:            WindowSizeService,) {

    const fg = this.fb.group({
      name:               [''],
      emailAddress:       ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: User, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value.trim();
      item.emailAddress       = formGroup.controls['emailAddress'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: User, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.name,
        emailAddress:         item.emailAddress
      });
    };

  }

  ngOnInit() {

    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => {

        this.signInContext = signInContext;

        if (!!this.signInContext.user) {
          this.fuService.setItem(clone(signInContext.user));
        }

      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  ngAfterViewInit() {

    this.windowSize$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(windowSize => {
        const widthString = `${windowSize.sideMenuWidth}px`;
        this.mainDiv.nativeElement.style.marginLeft = widthString;
      });

  }

  async save() {

    if (!this.validInput()) {
      return;
    }

    // Check if emailAddress changed
    if(this.fuService.item.emailAddress.trim() !== this.signInContext.user.emailAddress) {

      await this.authService.updateEmailAddress(this.fuService.item.emailAddress.trim())
        .then(() => {

          // Check if name changed
          if(this.fuService.item.name.trim() !== this.signInContext.user.name) {

            return  this.authService.updateDisplayName(this.fuService.item.name.trim());

          }

        })
        .then(() => {

          this.userService.updateUser(this.signInContext.customer.FSKey, this.fuService.item);

          this.fuService.openSnackBar('Profile updated');

          this.fuService.setItem(this.fuService.item);

          this.authService.pushSignInContext(this.signInContext.customer, this.fuService.item, this.localDataService);

        })
        .catch(error => {

          // Error will occur when Google requires the User to Sign In again
          this.messageDialogService.displayMessage(error);

        });

    }

  }

  validInput(): boolean {

    this.fuService.resetErrorDisplay();

    let result = true;

    // Check User Details
    if (!this.fuService.item.name || !this.fuService.item.name.trim()) {
      result = false;
      this.fuService.addErrorMessage('Name field cannot be empty');
    }

    if (!this.fuService.item.emailAddress || !this.fuService.item.emailAddress.trim()) {
      result = false;
      this.fuService.addErrorMessage('Email address field cannot be empty');
    }

    return result;

  }

  updatePassword(state: boolean) {

    this.updatingPassword = state;

  }

  cancel() {

    this.fuService.cancel();

  }

}

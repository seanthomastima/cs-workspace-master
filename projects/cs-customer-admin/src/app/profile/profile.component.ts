import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                             from '@angular/core';
import { Subject }                                                                                        from 'rxjs';
import { WindowSizeService }                                                                              from '../model/services/window-size.service';
import { finalize, takeUntil }                                                                            from 'rxjs/operators';
import { AuthService }                                                                                    from '../model/services/auth.service';
import { SignInContext }                                                                                  from '../model/security/sign-in-context';
import { AngularFireFunctions }                                                                           from '@angular/fire/functions';
import { MatSnackBar }                                                                                    from '@angular/material/snack-bar';
import clone                                                                                              from 'lodash/clone';
import { FormBuilder, FormGroup }                                                                         from '@angular/forms';
import { FormUtilitiesSingleService }                                                                     from 'form-utilities';
import { Administrator }                                                                                  from 'cs-shared-components';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: []
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  waiting                             = false;
  updatingPassword                    = false; // Displays UpdatePassword component when true
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$                            = new Subject();

  constructor(private elementRef:                   ElementRef,
              private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesSingleService<Administrator>,
              private fb:                           FormBuilder,
              private authService:                  AuthService,
              private snackBar:                     MatSnackBar,
              private windowSizeService:            WindowSizeService) {

    const fg = this.fb.group({
      name:               [''],
      emailAddress:       ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: Administrator, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value.trim();
      item.emailAddress       = formGroup.controls['emailAddress'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: Administrator, formGroup: FormGroup) => {
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

        if (!!this.signInContext.administrator) {
          this.fuService.setItem(clone(signInContext.administrator));
        }

      });

    this.fuService.externalSave = () => { this.save(); };

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

  save() {

    if (!this.validInput()) {
      return;
    }

    this.waiting = true;

    const callable = this.afFunctions.httpsCallable('updateCustomerAdministrator');

    callable({ ...this.fuService.item })
      .pipe(
        finalize(() => this.waiting = false)
      )
      .subscribe((result) => {

        if (!!result.Error) {

          this.fuService.addErrorMessage(result.Error);
          this.waiting = false;
          this.fuService.setPageState(this.fuService.pageStateOptions.ERROR);

        } else {

          this.fuService.setItem(this.fuService.item);
          this.snackBar.open('Update successful','', {duration: 2000});
          this.authService.pushSignInContext(this.signInContext.customer, this.fuService.item, this.signInContext.localDataService);

        }

      });

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

}

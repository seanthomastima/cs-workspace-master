import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                             from '@angular/core';
import { SignInContext }                                                                                  from '../model/security/sign-in-context';
import { of, Subject }                                                                                    from 'rxjs';
import { AngularFireFunctions }                                                                           from '@angular/fire/functions';
import { MatSnackBar }                                                                                    from '@angular/material/snack-bar';
import { FormBuilder, FormGroup }                                                                         from '@angular/forms';
import { LocalDataService }                                                                               from '../model/services/local-data.service';
import { WindowSizeService }                                                                              from '../model/services/window-size.service';
import { AuthService }                                                                                    from '../model/services/auth.service';
import { filter, finalize, first, flatMap, switchMap, takeUntil, tap }                                    from 'rxjs/operators';
import { UserService }                                                                                    from '../model/services/user.service';
import { FormUtilitiesService }                                                                           from 'form-utilities';
import { ConfirmationDialogService, FirestoreUtilsService, MessageDialogService }                         from 'shared-components';
import { EmailTemplateService, EnrolmentRequest, SendEmailDetails, User }                                 from 'cs-shared-components';
import { FS }                                                                                             from '../../../../shared-files/firestore-constants';

@Component({
  selector: 'manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]
})
export class ManageUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  displayMode                         = 'VIEW';
  waiting                             = false;
  errorMessage                        = '';
  destroy$                            = new Subject();
  windowSize$                         = this.windowSizeService.windowSize$;
  displayAddEmailAndName              = false;
  emailDetails                        = new SendEmailDetails();
  enrolmentRequest:                   EnrolmentRequest = new EnrolmentRequest();

  constructor(private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesService<User>,
              private snackBar:                     MatSnackBar,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private confirmationDialogService:    ConfirmationDialogService,
              private messageDialogService:         MessageDialogService,
              private userService:                  UserService,
              private authService:                  AuthService,
              private emailTemplateService:         EmailTemplateService,
              private firestoreUtilsService:        FirestoreUtilsService) {

    this.fuService.item = new User();

    const fg = this.fb.group({
      name:               [],
      emailAddress:       [],
      mustResetPassword:  [],
      active:             []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: User, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value.trim();
      item.emailAddress       = formGroup.controls['emailAddress'].value.trim();
      item.mustResetPassword  = formGroup.controls['mustResetPassword'].value;
      item.active             = formGroup.controls['active'].value;
    };

    this.fuService.updateFGFromItem = (item: User, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.name,
        emailAddress:         item.emailAddress,
        mustResetPassword:    item.mustResetPassword,
        active:               item.active
      });
    };

    this.fuService.filterList = (filterString: string, list: User[], filteredList: User[]): User[] => {

      return list.filter(
        user => {
          return user.name.toLowerCase().includes(filterString.toLowerCase());
        });

    };

  }

  ngOnInit() {

    this.localDataService.users$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(users => {
        this.fuService.items = JSON.parse(JSON.stringify(users));
        this.fuService.filteredItems = JSON.parse(JSON.stringify(users));
      });

    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => this.signInContext = signInContext);

    this.fuService.externalSave = () => { this.save(); };

    this.fuService.externalDelete = () => { this.delete(); };

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

  edit(user: User) {

    this.fuService.edit(user, user.FSKey !== this.fuService.item.FSKey);

  }

  switchLayoutToAddUser() {

    this.displayMode = 'ADD_USER';

    this.addEmailAddressAndName();

  }

  save() {

    this.displayMode = 'VIEW';

    if (!this.validEntries()) {
      return;
    }

    this.waiting = true;

    const callable = this.afFunctions.httpsCallable('updateCustomerUser');

    callable(this.fuService.item)
      .pipe(
        finalize(() => this.waiting = false)
      )
      .subscribe((result) => {

        if (!!result.Error) {
          this.errorMessage = result.Error;
          this.displayMode = 'ERROR';
        } else {
          this.snackBar.open('Update User successful','', {duration: 3000});
        }

        this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

        this.fuService.item = new User();

      });

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete User: ' + this.fuService.item.name)
      .then(confirmed => {

        if (confirmed) {

          this.displayMode = 'VIEW';

          this.waiting = true;

          const callable = this.afFunctions.httpsCallable('deleteCustomerUser');

          callable(this.fuService.item)
            .pipe(
              finalize(() => this.waiting = false)
            )
            .subscribe((result) => {

              if (!!result.Error) {
                this.errorMessage = result.Error;
                this.displayMode = 'ERROR';
              } else {
                this.snackBar.open('Delete User successful','', {duration: 3000});
                this.deleteGoogleUser(this.fuService.item.FSKey);
              }

              this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

              this.fuService.item = new User();

            });

        }

      });

  }

  deleteGoogleUser(userFSKey: string) {

    this.userService.userHasValidSignInOption(userFSKey)
      .pipe(
        first(),
        filter(res => !res),
        switchMap(() => this.userService.deleteSignInUser(userFSKey))
      )
      .subscribe();

  }

  addUser(formValues) {

    // Check if Add New User was cancelled
    if (!formValues) {

      this.displayMode = 'VIEW';

      return;

    }

    this.displayMode = 'VIEW';

    this.waiting = true;

    // Add customerFSKey to User object to save
    const customerFSKeyObject = {customerFSKey: this.signInContext.customer.FSKey};
    formValues = {...customerFSKeyObject, ...formValues};

    // First check in Signed In User exists
    this.userService.getUIDFromEmailAddress(formValues.emailAddress)
      .pipe(
        finalize(() => this.waiting = false),
        flatMap(uid => {
          if (!!uid) {
            return of(uid);
          } else {
            // Sign In User does not exist so add
            return this.userService.addSignInUser(formValues);
          }
        }),
        flatMap(uid => this.userService.addUser(this.signInContext.customer.FSKey, uid, formValues))
      )
      .subscribe(result => {

          // this.snackBar.open('Add User successful', '', {duration: 3000});

          this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

          this.fuService.item = new User();

        }

      );

  }

  removeErrorDisplay() {

    this.displayMode = 'VIEW';

    this.errorMessage = '';

  }

  validEntries(): boolean {

    this.fuService.errorMessages = [];

    let result = true;

    if (!this.fuService.fg.controls['name'].value || !this.fuService.fg.controls['name'].value.trim()) {
      result = false;
      this.fuService.errorMessages.push('Name field cannot be empty');
    }

    if (!this.fuService.fg.controls['emailAddress'].value || !this.fuService.fg.controls['emailAddress'].value.trim()) {
      result = false;
      this.fuService.errorMessages.push('Email address field cannot be empty');
    }

    return result;

  }

  addEmailAddressAndName() {

    this.emailTemplateService.getEmailTemplateByName(this.localDataService.emailTemplate$, 'Customer User')
      .subscribe(emailTemplate => {

        if (!!emailTemplate) {

          this.emailDetails.subject         = emailTemplate.subject;
          this.emailDetails.body            = emailTemplate.body;
          this.emailDetails.enrolmentPath   = `${FS.Customers}/${this.signInContext.customer.FSKey}/${FS.EnrolmentRequests}`;
          this.emailDetails.enrolmentKey    = this.firestoreUtilsService.docName();

          this.enrolmentRequest.customerFSKey      = this.signInContext.customer.FSKey;
          this.enrolmentRequest.enrolmentType      = 'Customer User';

          // Trigger display of data entry components for name and emailAddress
          this.displayAddEmailAndName = true;

        } else {

          this.fuService.errorMessages.push('Email Template not found: Customer User');

        }

      });

  }

  emailSent(emailSent) {

    if (emailSent) {

      this.snackBar.open('Email sent', '', {
        duration: 3000,
      });

    }

    this. displayAddEmailAndName = false;

    this.displayMode = 'VIEW';

  }

}

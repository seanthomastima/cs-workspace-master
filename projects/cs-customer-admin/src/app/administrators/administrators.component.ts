import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                             from '@angular/core';
import { Subject }                                                                                        from 'rxjs';
import { AngularFireFunctions }                                                                           from '@angular/fire/functions';
import { FormBuilder, FormGroup }                                                                         from '@angular/forms';
import { LocalDataService }                                                                               from '../model/services/local-data.service';
import { finalize, map, takeUntil }                                                                       from 'rxjs/operators';
import { MatSnackBar }                                                                                    from '@angular/material/snack-bar';
import { WindowSizeService }                                                                              from '../model/services/window-size.service';
import { AuthService }                                                                                    from '../model/services/auth.service';
import { SignInContext }                                                                                  from '../model/security/sign-in-context';
import { FormUtilitiesService }                                                                           from 'form-utilities';
import { ConfirmationDialogService, FirestoreUtilsService, MessageDialogService }                         from 'shared-components';
import { Administrator, EmailTemplateService, EnrolmentRequest, SendEmailDetails }                        from 'cs-shared-components';
import { FS }                                                                                             from '../../../../shared-files/firestore-constants';

class DisplayObject {
  FSKey:                string; // FSKey is used to uniquely identify each DisplayObject
  administrator:        Administrator;
}

@Component({
  selector: 'administrators',
  templateUrl: './administrators.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]
})
export class AdministratorsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  destroy$                            = new Subject();
  displayMode                         = 'VIEW';
  errorMessage                        = '';
  windowSize$                         = this.windowSizeService.windowSize$;
  loading                             = false;
  displayAddEmail                     = false;
  emailDetails                        = new SendEmailDetails();
  enrolmentRequest:                   EnrolmentRequest = new EnrolmentRequest();

  constructor(private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesService<DisplayObject>,
              private snackBar:                     MatSnackBar,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private confirmationDialogService:    ConfirmationDialogService,
              private messageDialogService:         MessageDialogService,
              private emailTemplateService:         EmailTemplateService,
              private firestoreUtilsService:        FirestoreUtilsService,
              private authService:                  AuthService) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      name:               [],
      emailAddress:       []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {
      item.administrator.name               = formGroup.controls['name'].value.trim();
      item.administrator.emailAddress       = formGroup.controls['emailAddress'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.administrator.name,
        emailAddress:         item.administrator.emailAddress
      });
    };

  }

  ngOnInit() {

    console.log('init');

    this.localDataService.customerAdministrators$
      .pipe(
        takeUntil(this.destroy$),
        map(customerAdministrators => this.getDisplayObjects(customerAdministrators)),
      )
      .subscribe(displayObjects => this.fuService.items = JSON.parse(JSON.stringify(displayObjects)));

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

  switchLayoutToAddUser() {

    this.displayMode = 'ADD_USER';

    this.addEmailAddress();

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.FSKey !== this.fuService.item.FSKey);

  }

  save() {

    if (!this.validEntries()) {
      return;
    }

    this.loading = true;

    const callable = this.afFunctions.httpsCallable('updateCustomerAdministrator');

    callable({ ...this.fuService.item })
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(result => {

        if (!!result.Error) {

          this.errorMessage = result.Error;

          this.displayMode = 'ERROR';

        } else {

          this.snackBar.open('Update successful','', {duration: 2000});

          this.authService.pushSignInContext(this.signInContext.customer, this.fuService.item.administrator, this.localDataService);

        }

        this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

        this.fuService.item = new DisplayObject();

      });

  }

  removeErrorDisplay() {

    this.displayMode = 'VIEW';

    this.errorMessage = '';

  }

  delete() {

    if (this.fuService.items.length <= 1) {

      this.messageDialogService.displayMessage('Cannot delete last Administrator');

      return;

    }

    this.confirmationDialogService.confirmSelection('Delete Administrator?')
      .then(confirmed => {
        if (confirmed) {

          this.loading = true;

          const callable = this.afFunctions.httpsCallable('deleteCustomerAdministrator');

          callable({ ...this.fuService.item.administrator })
            .pipe(
              finalize(() => this.loading = false)
            )
            .subscribe( () => this.loading = false);

        }
      });

  }

  addAdministrator(formValues) {

    this.displayMode = 'VIEW';

    if (!formValues) {
      return;
    }

    const customerFSKeyObject = {customerFSKey: this.signInContext.customer.FSKey};

    this.loading = true;

    const callable = this.afFunctions.httpsCallable('addCustomerAdministrator');

    callable({...customerFSKeyObject, ...formValues})
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe((result) => {

        if (!!result.Error) {
          this.errorMessage = result.Error;
          this.displayMode = 'ERROR';
        } else {
          this.snackBar.open('Add Administrator successful','', {duration: 2000});
        }

        this.fuService.setPageState(this.fuService.pageStateOptions.VIEW);

        this.fuService.item = new DisplayObject();
      });

  }

  getDisplayObjects(administrators: Administrator[]): DisplayObject[] {

    return administrators.map(administrator => {

        return {
          FSKey:            administrator.FSKey,
          administrator,
        };

      }

    );

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

  addEmailAddress() {

    this.emailTemplateService.getEmailTemplateByName(this.localDataService.emailTemplate$, 'Customer Administrator')
      .subscribe(emailTemplate => {

        if (!!emailTemplate) {

          this.emailDetails.subject         = emailTemplate.subject;
          this.emailDetails.body            = emailTemplate.body;
          this.emailDetails.enrolmentPath   = `${FS.Customers}/${this.signInContext.customer.FSKey}/${FS.EnrolmentRequests}`;
          this.emailDetails.enrolmentKey    = this.firestoreUtilsService.docName();

          this.enrolmentRequest.customerFSKey      = this.signInContext.customer.FSKey;
          this.enrolmentRequest.enrolmentType      = 'Customer Administrator';

          this.displayAddEmail = true;

        } else {

          this.fuService.errorMessages.push('Email Template not found: Customer Administrator');

        }

      });

  }

  emailSent(emailSent) {

    this.displayAddEmail = false;

    if (emailSent) {

      this.snackBar.open('Email sent', '', {
        duration: 3000,
      });

    }

    this. displayAddEmail = false;

    this.displayMode = 'VIEW';

  }

}

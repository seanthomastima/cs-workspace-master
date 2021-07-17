import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                       from '@angular/core';
import { Observable, Subject }                                                                      from 'rxjs';
import { AngularFireFunctions }                                                                     from '@angular/fire/functions';
import { MatSnackBar }                                                                              from '@angular/material/snack-bar';
import { FormBuilder, FormGroup }                                                                   from '@angular/forms';
import { LocalDataService }                                                                         from '../model/services/local-data.service';
import { Customer }                                                                                 from '../model/classes/customer';
import { finalize, first, map, takeUntil }                                                          from 'rxjs/operators';
import { CustomersService }                                                                         from '../model/services/customers.service';
import { ConfirmationDialogService, FirestoreUtilsService, WindowSizeService }                      from 'shared-components';
import { FormUtilitiesService }                                                                     from 'form-utilities';
import { FS }                                                                                       from '../../../../shared-files/firestore-constants';
import { AuthService }                                                                              from '../model/services/auth.service';
import { SignInContext }                                                                            from '../model/security/sign-in-context';
import {Administrator, EmailTemplateService, EnrolmentRequest, SendEmailDetails} from 'cs-shared-components';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: []
})
export class CustomersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv: ElementRef;
  destroy$        = new Subject();
  displayMode                         = 'VIEW';
  signInContext:                      SignInContext;
  windowSize$                         = this.windowSizeService.windowSize$;
  loading                             = false;
  displayAddEmail                     = false;
  emailDetails                        = new SendEmailDetails();
  enrolmentRequest:                   EnrolmentRequest = new EnrolmentRequest();
  selectedCustomerAdministrators$:    Observable<Administrator[]>;

  constructor(private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesService<Customer>,
              private snackBar:                     MatSnackBar,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private authService:                  AuthService,
              private customerService:              CustomersService,
              private windowSizeService:            WindowSizeService,
              private emailTemplateService:         EmailTemplateService,
              private firestoreUtilsService:        FirestoreUtilsService,
              private confirmationDialogService:    ConfirmationDialogService) {

    this.fuService.item = new Customer();

    const fg = this.fb.group({
      name:                 [],
      description:          [],
      customerSignInKey:    [],
      active:               []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: Customer, formGroup: FormGroup) => {
      item.name                 = formGroup.controls['name'].value;
      item.description          = formGroup.controls['description'].value;
      item.customerSignInKey    = formGroup.controls['customerSignInKey'].value;
      item.active               = formGroup.controls['active'].value;
    };

    this.fuService.updateFGFromItem = (item: Customer, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:               item.name,
        description:        item.description,
        customerSignInKey:  item.customerSignInKey,
        active:             item.active
      });
    };

  }

  ngOnInit() {

    this.authService.signInContext$
      .subscribe(signInContext => this.signInContext = signInContext);

    this.localDataService.customers$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(customers => this.fuService.items = JSON.parse(JSON.stringify(customers)));

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
        this.mainDiv.nativeElement.style.marginLeft = `${windowSize.sideMenuWidth}px`;
      });

  }

  edit(customer: Customer) {

    this.fuService.edit(customer, customer.FSKey !== this.fuService.item.FSKey);

    // Get CustomerAdministrators
    this.selectedCustomerAdministrators$ = this.customerService.getAdministratorsForCustomer(this.fuService.item.FSKey);

  }

  save() {

    this.loading = true;

    const callable = this.afFunctions.httpsCallable('updateCustomer');

    callable(Object.assign({}, this.fuService.item))
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe((result) => {

        this.fuService.cancel();

      });

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete Customer?')
      .then(confirmed => {
        if (confirmed) {

          this.loading = true;

          const callable = this.afFunctions.httpsCallable('deleteCustomer');

          callable({ customer: this.fuService.item })
            .pipe(
              finalize(() => this.loading = false)
            )
            .subscribe(() => {

              this.displayMode = 'VIEW';

              this.fuService.cancel();

            });

        }
      });

  }

  switchLayoutToAddCustomer() {

    this.displayMode = 'ADD';

  }

  switchLayoutToAddCustomerAdministrator() {

    this.displayMode = 'ADD_ADMINISTRATOR';

  }

  addCustomer(formValues) {

    this.displayMode = 'VIEW';

    if (formValues) {

      this.loading = true;

      const callable = this.afFunctions.httpsCallable('addCustomer');

      callable({ customer: formValues })
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe();

    }

  }

  addCustomerAdministrator(formValues) {

    this.displayMode = 'VIEW';

    if (formValues) {

      this.loading = true;

      const callable = this.afFunctions.httpsCallable('addCustomerAdministrator');

      callable({ customerFSKey: this.fuService.item.FSKey, userDetails: formValues })
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe((result) => {
          console.log(result);
        });

    }

  }

  addEmailAddress() {

    this.emailTemplateService.getEmailTemplateByName(this.localDataService.emailTemplate$, 'Customer Administrator')
      .subscribe(emailTemplate => {

        if (!!emailTemplate) {

          this.emailDetails.subject         = emailTemplate.subject;
          this.emailDetails.body            = emailTemplate.body;
          this.emailDetails.enrolmentPath   = `${FS.Customers}/${this.fuService.item.FSKey}/${FS.EnrolmentRequests}`;
          this.emailDetails.enrolmentKey    = this.firestoreUtilsService.docName();

          this.enrolmentRequest.customerFSKey      = this.fuService.item.FSKey;
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

  }

}

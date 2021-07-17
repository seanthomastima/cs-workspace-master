import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                       from '@angular/core';
import { Subject }                                                                                  from 'rxjs';
import { AngularFireFunctions }                                                                     from '@angular/fire/functions';
import { MatSnackBar }                                                                              from '@angular/material/snack-bar';
import { FormBuilder, FormGroup }                                                                   from '@angular/forms';
import { LocalDataService }                                                                         from '../model/services/local-data.service';
import { Customer }                                                                                 from '../../../../cs-shared-components/src/lib/model/classes/customer';
import { finalize, takeUntil }                                                                      from 'rxjs/operators';
import { CustomerService }                                                                          from '../model/services/customer.service';
import { WindowSizeService }                                                                        from '../model/services/window-size.service';
import { SignInContext }                                                                            from '../model/security/sign-in-context';
import { AuthService }                                                                              from '../model/services/auth.service';
import clone                                                                                        from 'lodash/clone';
import { FormUtilitiesSingleService }                                                               from 'form-utilities';


@Component({
  selector: 'customers',
  templateUrl: './customer-details.component.html',
  styleUrls: []
})
export class CustomerDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv: ElementRef;
  destroy$                            = new Subject();
  signInContext:                      SignInContext;
  windowSize$                         = this.windowSizeService.windowSize$;
  waiting                             = false;

  constructor(private afFunctions:                  AngularFireFunctions,
              public authService:                   AuthService,
              private snackBar:                     MatSnackBar,
              public fuService:                     FormUtilitiesSingleService<Customer>,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private customerService:              CustomerService,
              private windowSizeService:            WindowSizeService) {

    const fg = this.fb.group({
      name:               [''],
      description:        [''],
      customerSignInKey:  ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: Customer, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value.trim();
      item.description        = formGroup.controls['description'].value.trim();
      item.customerSignInKey  = formGroup.controls['customerSignInKey'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: Customer, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.name,
        description:          item.description,
        customerSignInKey:    item.customerSignInKey
      });
    };

  }

  ngOnInit() {

    // Get CustomerAdministrators
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((signInContext: SignInContext) => {

        this.signInContext = signInContext;

        if (!!signInContext.customer) {

          this.fuService.setItem(clone(signInContext.customer));

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

  test(event) {
    if (event.key === 'Enter') {
      console.log(event);
    }

    event.stopPropagation();
  }

  save() {

    if (!this.validEntries()) {
      return;
    }

    this.waiting = true;

    const callable = this.afFunctions.httpsCallable('updateCustomer');

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

          this.authService.pushSignInContext(this.fuService.item, this.signInContext.administrator, this.localDataService);

        }

      });

  }

  removeErrorDisplay() {

    this.fuService.resetErrorDisplay();

  }

  validEntries(): boolean {

    this.fuService.errorMessages = [];

    let result = true;

    if (!this.fuService.fg.controls['name'].value || !this.fuService.fg.controls['name'].value.trim()) {
      result = false;
      this.fuService.errorMessages.push('Name field cannot be empty');
    }

    if (!this.fuService.fg.controls['customerSignInKey'].value || !this.fuService.fg.controls['customerSignInKey'].value.trim()) {
      result = false;
      this.fuService.errorMessages.push('Customer SignIn Key field cannot be empty');
    }

    return result;

  }

}

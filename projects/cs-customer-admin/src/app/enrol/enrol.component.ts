import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild }                from '@angular/core';
import { ActivatedRoute }                                                                                       from '@angular/router';
import { WindowSizeService }                                                                                    from '../model/services/window-size.service';
import {first, flatMap, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of, Subject }                                              from 'rxjs';
import { MessageDialogService }                                                                                 from 'shared-components';
import { EnrolmentRequest, EnrolmentRequestsService, User }                                                     from 'cs-shared-components';
import { UserService }                                                                                          from '../model/services/user.service';
import { AuthService }                                                                                          from '../model/services/auth.service';
import { AngularFireFunctions }                                                                                 from '@angular/fire/functions';
import { CustomerService }                                                                                      from '../model/services/customer.service';

@Component({
  selector: 'enrol',
  templateUrl: './enrol.component.html',
  styleUrls: []
})
export class EnrolComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('main') mainDiv:         ElementRef;
  signInContext$                      = this.authService.signInContext$;
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$                            = new Subject();
  displayNamePasswordForm$            = new BehaviorSubject<boolean>(false);
  namePasswordForm$                   = new Subject<{name: string; password: string}>();
  initialRecipientName                = ''; // Passed to cs-name-password component in template
  displayMessages:                    string[] = [];

  constructor(private route:                        ActivatedRoute,
              private authService:                  AuthService,
              private afFunctions:                  AngularFireFunctions,
              private windowSizeService:            WindowSizeService,
              private messageDialogService:         MessageDialogService,
              private enrolmentRequestsService:     EnrolmentRequestsService,
              private userService:                  UserService,
              private customerService:              CustomerService,
              private changeDetectorRef:            ChangeDetectorRef) { }

  ngOnInit() {

    this.route.queryParams
      .pipe(
        first()
      )
      .subscribe(params => {

        const enrolCode = params['enrolCode'];

        if (enrolCode === undefined) {

          this.messageDialogService.displayMessage('No enrolment code was provided');

          return;

        }

        this.enrolmentRequestsService.getEnrolmentRequestByFSKey(enrolCode)
          .pipe(
            first()
          )
          .subscribe(enrolmentRequest => {

            if (!!enrolmentRequest && !enrolmentRequest.enrolmentCompleted) {

              this.processEnrolmentRequest(enrolmentRequest);

            } else {

              this.messageDialogService.displayMessage('Enrolment code is not valid');

            }
          });


      });

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

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  processEnrolmentRequest(enrolmentRequest: EnrolmentRequest) {

    this.initialRecipientName = enrolmentRequest.recipientName;

    this.displayMessages = [];

    this.userService.getOrCreateGoogleAuthenticatedUser(
      enrolmentRequest.customerFSKey,
      enrolmentRequest.recipientEmailAddress,
      this.displayMessages,
      this.displayNamePasswordForm$,
      this.namePasswordForm$,
      this.changeDetectorRef
    )
      .pipe(
        flatMap(([authUserDetails, isCustomerUser, customerFSKey]) => {

          if (!isCustomerUser) {

            this.displayMessages.push('Customer User is being created for: ' + enrolmentRequest.recipientEmailAddress);
            this.changeDetectorRef.detectChanges(); // Necessary to trigger update of template

            const newUser = new User();
            newUser.name  = authUserDetails.name;
            newUser.emailAddress = authUserDetails.emailAddress;
            newUser.customerFSKey = customerFSKey;

            // Creating Customer User
            return combineLatest([
              this.userService.addUser(enrolmentRequest.customerFSKey, authUserDetails.UID, newUser),
              of(true)
            ])
          } else {

            this.displayMessages.push('Customer User was found for: ' + enrolmentRequest.recipientEmailAddress);
            this.changeDetectorRef.detectChanges(); // Necessary to trigger update of template

            return combineLatest([
              of(authUserDetails.UID),
              of(isCustomerUser)
            ])

          }

        }),
        flatMap(([UID, isCustomerUser]) => {

          if (UID && isCustomerUser && enrolmentRequest.enrolmentType === 'Customer Administrator') {

            this.displayMessages.push('Creating Customer Administration record');
            this.changeDetectorRef.detectChanges(); // Necessary to trigger update of template

            // Creating Customer Administration record
            return this.customerService.setUserAsCustomerAdministrator(enrolmentRequest.customerFSKey, UID);

          } else {

            return of(true);

          }

        })
      )
      .subscribe(() => {

        this.displayMessages.push('Enrolment is complete');
        this.changeDetectorRef.detectChanges();

        this.enrolmentRequestsService.completeEnrolment(enrolmentRequest);

      });


  }

  getEmailAddressIsCustomerUser(emailAddress: string, customerFSKey: string): Observable<boolean> {

    const callable = this.afFunctions.httpsCallable('customerHasUser');

    return callable({emailAddress, customerFSKey})
      .pipe(
        first(),
        map(res => res.hasUser)
      );

  }


  getNamePassword(formValues) {

    this.displayNamePasswordForm$.next(false);
    this.changeDetectorRef.detectChanges();

    if (formValues) {
      this.namePasswordForm$.next({name: formValues.name, password: formValues.password});
    }

    this.namePasswordForm$.complete();

  }

}

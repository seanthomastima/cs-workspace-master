import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                 from '@angular/core';
import { SignInContext }                                                                                      from '../model/security/sign-in-context';
import { BehaviorSubject, combineLatest, Subject }                                                            from 'rxjs';
import { FormUtilitiesService }                                                                               from 'form-utilities';
import { MatSnackBar }                                                                                        from '@angular/material/snack-bar';
import { FormBuilder, FormGroup }                                                                             from '@angular/forms';
import { LocalDataService }                                                                                   from '../model/services/local-data.service';
import { WindowSizeService }                                                                                  from '../model/services/window-size.service';
import { ConfirmationDialogService, MessageDialogService, UtilitiesService }                                  from 'shared-components';
import { AuthService }                                                                                        from '../model/services/auth.service';
import { EnrolmentRequest, EnrolmentRequestsService }                                                         from 'cs-shared-components';
import { takeUntil, tap, map }                                                                                from 'rxjs/operators';

class DisplayObject {
  FSKey:                              string; // FSKey is used to uniquely identify each DisplayObject
  enrolmentRequest                    = new  EnrolmentRequest();
  createdTimeStampString              = '';
  enrolmentCompletedTimeStampString   = '';
}

@Component({
  selector: 'enrolments',
  templateUrl: './manage-enrolments.component.html',
  styleUrls: []
})
export class ManageEnrolmentsComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('main') mainDiv:         ElementRef;
  signInContext:                      SignInContext;
  displayCompletedEnrolments$         = new BehaviorSubject<boolean>(false);
  destroy$                            = new Subject();
  errorMessage                        = '';
  windowSize$                         = this.windowSizeService.windowSize$;

  constructor(public fuService:                     FormUtilitiesService<DisplayObject>,
              private snackBar:                     MatSnackBar,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private confirmationDialogService:    ConfirmationDialogService,
              private messageDialogService:         MessageDialogService,
              private enrolmentRequestsService:     EnrolmentRequestsService,
              private utilitiesService:             UtilitiesService,
              private authService:                  AuthService) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      recipientEmailAddress:          [],
      enrolmentType:                  [],
      createdTimeStampString:         [],
      enrolmentCompletedTimeStamp:    [],
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {

      item.enrolmentRequest.recipientEmailAddress       = formGroup.controls['recipientEmailAddress'].value.trim();

      item.enrolmentRequest.enrolmentType               = formGroup.controls['enrolmentType'].value.trim();

    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {

      formGroup.patchValue({

        recipientEmailAddress:        item.enrolmentRequest.recipientEmailAddress,

        enrolmentType:                item.enrolmentRequest.enrolmentType,

      });
    };

  }

  ngOnInit() {

    combineLatest([
      this.displayCompletedEnrolments$,
      this.localDataService.enrolmentRequests$
    ])
      .pipe(
        map(([displayCompleted, enrolmentRequests]) => this.createDisplayObjects(displayCompleted, enrolmentRequests)),
        takeUntil(this.destroy$),
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

    this.displayCompletedEnrolments$.complete();

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

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.enrolmentRequest.FSKey !== this.fuService.item.enrolmentRequest.FSKey);

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete Enrolment?')
      .then(confirmed => {

        if (confirmed) {

          this.enrolmentRequestsService.deleteEnrolmentRequest(this.signInContext.customer.FSKey, this.fuService.item.enrolmentRequest.FSKey);

        }

      });

  }

  createDisplayObjects(displayCompleted: boolean, enrolmentRequests: EnrolmentRequest[]): DisplayObject[] {

    const displayObjects: DisplayObject[] = [];

    enrolmentRequests.map(enrolmentRequest => {

      if (displayCompleted || (!displayCompleted && !enrolmentRequest.enrolmentCompleted) ) {

        const displayObject = new DisplayObject();

        displayObject.FSKey = enrolmentRequest.FSKey;

        displayObject.enrolmentRequest = enrolmentRequest;

        displayObject.createdTimeStampString = this.utilitiesService.msToDateTimeDisplay(enrolmentRequest.createdTimeStamp);

        displayObject.enrolmentCompletedTimeStampString = this.utilitiesService.msToDateTimeDisplay(enrolmentRequest.enrolmentCompletedTimeStamp);

        displayObjects.push(displayObject);

      }

    });

    return displayObjects;

  }

  setDisplayCompletedEnrolments(event) {

    if (!!event) {

      this.displayCompletedEnrolments$.next(event.value);

    }

  }

}

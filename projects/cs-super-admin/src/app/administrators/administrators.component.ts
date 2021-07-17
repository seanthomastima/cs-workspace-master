import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                             from '@angular/core';
import { Subject }                                                                                        from 'rxjs';
import { AngularFireFunctions }                                                                           from '@angular/fire/functions';
import { FormBuilder, FormGroup }                                                                         from '@angular/forms';
import { LocalDataService }                                                                               from '../model/services/local-data.service';
import { finalize, map, takeUntil, tap }                                                                  from 'rxjs/operators';
import {ConfirmationDialogService, MessageDialogService, WindowSizeService} from 'shared-components';
import { FormUtilitiesService }                                                                           from 'form-utilities';
import { Administrator }                                                                                  from 'cs-shared-components';

class DisplayObject {
  FSKey:                string; // FSKey is used to uniquely identify each DisplayObject
  name:                 string;
  emailAddress:         string;
}

@Component({
  selector: 'administrators',
  templateUrl: './administrators.component.html',
  styleUrls: []
})
export class AdministratorsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('main') mainDiv:         ElementRef;
  destroy$                            = new Subject();
  displayMode                         = 'VIEW';
  windowSize$                         = this.windowSizeService.windowSize$;
  loading                             = false;

  constructor(private afFunctions:                  AngularFireFunctions,
              public fuService:                     FormUtilitiesService<DisplayObject>,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private messageDialogService:         MessageDialogService,
              private confirmationDialogService:    ConfirmationDialogService) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      name:               [],
      emailAddress:       []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value;
      item.emailAddress       = formGroup.controls['emailAddress'].value;
    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.name,
        emailAddress:         item.emailAddress
      });
    };

  }

  ngOnInit() {

    this.localDataService.superAdministrators$
      .pipe(
        takeUntil(this.destroy$),
        map(superAdministrators => this.getDisplayObjects(superAdministrators)),
      )
      .subscribe(displayObjects => this.fuService.items = JSON.parse(JSON.stringify(displayObjects)));

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

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.FSKey !== this.fuService.item.FSKey);

  }

  save() {

    this.loading = true;

    const callable = this.afFunctions.httpsCallable('updateSuperAdministrator');

    callable(Object.assign({}, this.fuService.item))
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe((result) => {

        this.displayMode = 'VIEW';

        this.fuService.cancel();

      });

  }

  delete() {

    if (this.fuService.items.length <= 1) {

      this.messageDialogService.displayMessage('Cannot delete last Administrator');

      return;

    }

    this.confirmationDialogService.confirmSelection('Delete Super Administrator?')
      .then(confirmed => {
        if (confirmed) {

          this.loading = true;

          const callable = this.afFunctions.httpsCallable('deleteSuperAdministrator');

          callable({ userDetails: this.fuService.item })
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

  addSuperAdministrator(formValues) {

    this.displayMode = 'VIEW';

    if (formValues) {

      this.loading = true;

      const callable = this.afFunctions.httpsCallable('addSuperAdministrator');

      callable({ userDetails: formValues })
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe((result) => {
          console.log(result);
        });

    }

  }

  getDisplayObjects(superAdministrators: Administrator[]): DisplayObject[] {

    return superAdministrators.map(superAdministrator => {
        return {
          FSKey: superAdministrator.FSKey,
          name: superAdministrator.name,
          emailAddress: superAdministrator.emailAddress
        };
      }
    );

  }

}

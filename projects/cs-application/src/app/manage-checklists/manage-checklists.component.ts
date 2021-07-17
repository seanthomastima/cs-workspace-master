import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                   from '@angular/core';
import { Subject }                                                                                              from 'rxjs';
import { map, takeUntil }                                                                                       from 'rxjs/operators';
import { SignInContext }                                                                                        from '../model/security/sign-in-context';
import { AuthService }                                                                                          from '../model/services/auth.service';
import { LocalDataService }                                                                                     from '../model/services/local-data.service';
import { Checklist, ChecklistItem }                                                                             from '../model/classes/checklist';
import { FormBuilder, FormGroup }                                                                               from '@angular/forms';
import { RoleService }                                                                                          from '../model/services/role.service';
import { ConfirmationDialogService, WindowSizeService }                                                         from 'shared-components';
import { FormUtilitiesService }                                                                                 from 'form-utilities';
import { Role }                                                                                                 from 'cs-shared-components';
import { ChecklistService }                                                                                     from '../model/services/checklist.service';


class DisplayObject {
  checklist = new Checklist();
}

@Component({
  selector: 'manage-checklists',
  templateUrl: './manage-checklists.component.html',
  styleUrls: [],
  providers: [FormUtilitiesService]

})
export class ManageChecklistsComponent implements OnInit, OnDestroy, AfterViewInit {
  mainTabSelection                    = 'Checklists';
  signInContext:                      SignInContext;
  checklistItems:                     ChecklistItem[];  // For selected item
  sharedWithRoles:                    Role[];           // For selected item
  @ViewChild('main') mainDiv:         ElementRef;
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$                            = new Subject();

  constructor(public fuService:                     FormUtilitiesService<DisplayObject>,
              private checklistService:             ChecklistService,
              public confirmationDialogService:     ConfirmationDialogService,
              private fb:                           FormBuilder,
              private windowSizeService:            WindowSizeService,
              private localDataService:             LocalDataService,
              private roleService:                  RoleService,
              private authService:                  AuthService) {

    this.fuService.item = new DisplayObject();

    const fg = this.fb.group({
      name:               [''],
      description:        ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: DisplayObject, formGroup: FormGroup) => {
      item.checklist.name               = formGroup.controls['name'].value.trim();
      item.checklist.description        = formGroup.controls['description'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: DisplayObject, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.checklist.name,
        description:          item.checklist.description
      });
    };

  }

  ngOnInit() {

    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(signInContext => this.signInContext = signInContext);

    this.localDataService.checklists$
      .pipe(
        takeUntil(this.destroy$),
        map(checklists => this.getDisplayObjects(checklists)),
      )
      .subscribe(displayObjects => {
        this.fuService.items = JSON.parse(JSON.stringify(displayObjects));
      });

    this.fuService.externalSave = () => { this.save(); };

    this.fuService.externalDelete = () => { this.delete(); };

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

  setMainTab(tab: string) {

    this.mainTabSelection = tab;

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  addNewChecklist() {

    this.roleService.getOwningRole(this.signInContext, this.signInContext.user.FSKey)
      .subscribe(role => {

        if (role) {

          const checkList = new Checklist();

          checkList.owningRoleFSKey = role.FSKey;

          const newDisplayObject = new DisplayObject();
          newDisplayObject.checklist = checkList;

          this.fuService.addNew(newDisplayObject);

        }

      });

  }

  edit(displayObject: DisplayObject) {

    this.fuService.edit(displayObject, displayObject.checklist.FSKey !== this.fuService.item.checklist.FSKey);

  }

  save() {

    if (!this.validEntries()) {
      return;
    }

    if (this.fuService.pageState === this.fuService.pageStateOptions.ADD) {

      this.checklistService.addChecklist(this.signInContext.customer.FSKey, this.fuService.item.checklist);

    } else {

      this.checklistService.updateChecklist(this.signInContext.customer.FSKey, this.fuService.item.checklist);

    }

    this.fuService.cancel();

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete Checklist?')
      .then(confirmed => {
        if (confirmed) {

          this.fuService.openSnackBar('Checklist deleted: ' + this.fuService.item.checklist.name);

          this.checklistService.deleteChecklist(this.signInContext.customer.FSKey, this.fuService.item.checklist.FSKey);

        }
      });

  }

  getDisplayObjects(checklists: Checklist[]): DisplayObject[] {

    return checklists.map(checklist => {

        return {
          checklist
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

    return result;

  }

}

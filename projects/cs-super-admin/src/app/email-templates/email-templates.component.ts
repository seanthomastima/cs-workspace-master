import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                 from '@angular/core';
import { Subject }                                                                                            from 'rxjs';
import { FormUtilitiesService, PageStateOptions }                                                             from 'form-utilities';
import { FormBuilder, FormGroup }                                                                             from '@angular/forms';
import { LocalDataService }                                                                                   from '../model/services/local-data.service';
import { ConfirmationDialogService, WindowSizeService }                                                       from 'shared-components';
import { takeUntil }                                                                                          from 'rxjs/operators';
import { EmailTemplate, EmailTemplateService }                                                                from 'cs-shared-components';
import { FS }                                                                                                 from '../../../../shared-files/firestore-constants';

@Component({
  selector: 'email-templates',
  templateUrl: './email-templates.component.html',
  styleUrls: []
})
export class EmailTemplatesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('main') mainDiv:         ElementRef;
  destroy$                            = new Subject();
  windowSize$                         = this.windowSizeService.windowSize$;

  constructor(public fuService:                     FormUtilitiesService<EmailTemplate>,
              private fb:                           FormBuilder,
              private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private emailTemplateService:         EmailTemplateService,
              private confirmationDialogService:    ConfirmationDialogService) {

    this.fuService.item = new EmailTemplate();

    const fg = this.fb.group({
      name:               [],
      description:        [],
      subject:            [],
      body:               []
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: EmailTemplate, formGroup: FormGroup) => {
      item.name               = formGroup.controls['name'].value;
      item.description        = formGroup.controls['description'].value;
      item.subject            = formGroup.controls['subject'].value;
      item.body               = formGroup.controls['body'].value;
    };

    this.fuService.updateFGFromItem = (item: EmailTemplate, formGroup: FormGroup) => {
      formGroup.patchValue({
        name:                 item.name,
        description:          item.description,
        subject:              item.subject,
        body:                 item.body
      });
    };

  }

  ngOnInit() {

    this.localDataService.emailTemplate$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(emailTemplates => this.fuService.items = JSON.parse(JSON.stringify(emailTemplates)));

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

  edit(emailTemplate: EmailTemplate) {

    this.fuService.edit(emailTemplate, emailTemplate.FSKey !== this.fuService.item.FSKey);

  }

  save() {

    if (!this.validateFormEntries()) {

      return;

    }

    if (this.fuService.pageState === PageStateOptions.ADD) {

      this.emailTemplateService.addEmailTemplate(FS, this.fuService.item);

    } else {

      this.emailTemplateService.updateEmailTemplate(FS, this.fuService.item);

    }

    this.fuService.cancel();

  }

  delete() {

    this.confirmationDialogService.confirmSelection('Delete Super Administrator?')
      .then(confirmed => {

        if (confirmed) {

          this.emailTemplateService.deleteEmailTemplate(FS, this.fuService.item.FSKey)

          this.fuService.cancel();

        }

      });

  }

  addEmailTemplate() {

    this.fuService.addNew(new EmailTemplate());

  }

  validateFormEntries(): boolean {

    this.fuService.errorMessages = [];

    let res = true;

    if (this.fuService.item.name.length === 0 || this.fuService.item.body.length === 0 || this.fuService.item.subject.length === 0) {

      this.fuService.errorMessages.push('Name, Body and Subject are required');

      res = false;

    }

    return res;

  }

}

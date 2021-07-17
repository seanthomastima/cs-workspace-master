import { NgModule }                                                                     from '@angular/core';
import { CommonModule }                                                                 from '@angular/common';
import { ErrorMessageDisplayComponent }                                                 from './error-message-display/error-message-display.component';
import { WaitingSpinnerComponent }                                                      from './waiting-spinner/waiting-spinner.component';
import { MatProgressSpinnerModule }                                                     from '@angular/material/progress-spinner';
import { DisplayMessageComponent }                                                      from './display-message/display-message.component';
import { ConfirmationDialogComponent }                                                  from './dialogs/confirmation-dialog/confirmation-dialog.component';
import { MessageDialogComponent }                                                       from './dialogs/message-dialog/message-dialog.component';
import { FormsModule }                                                                  from '@angular/forms';
import { GenericFormComponent }                                                         from './generic-form/generic-form.component';
import { FormUtilitiesModule }                                                          from 'form-utilities';

@NgModule({
  declarations: [
    ErrorMessageDisplayComponent,
    WaitingSpinnerComponent,
    DisplayMessageComponent,
    ConfirmationDialogComponent,
    MessageDialogComponent,
    GenericFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    FormUtilitiesModule
  ],
  exports: [
    ErrorMessageDisplayComponent,
    WaitingSpinnerComponent,
    DisplayMessageComponent,
    ConfirmationDialogComponent,
    MessageDialogComponent,
    GenericFormComponent
  ]
})
export class SharedComponentsModule { }

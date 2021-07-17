import { NgModule }                                                                                     from '@angular/core';
import { SelectUserRoleDialogComponent }                                                                from './select-user-role-dialog/select-user-role-dialog.component';
import { CommonModule }                                                                                 from '@angular/common';
import { SendEmailComponent }                                                                           from './send-email/send-email.component';
import { FormUtilitiesModule }                                                                          from 'form-utilities';
import { SharedComponentsModule }                                                                       from 'shared-components';
import { NamePasswordComponent }                                                                        from './name-password-dialog/name-password.component';
import { FormsModule, ReactiveFormsModule }                                                             from '@angular/forms';
import { ScrollingModule }                                                                              from '@angular/cdk/scrolling';



@NgModule({
  declarations: [
    SelectUserRoleDialogComponent,
    SendEmailComponent,
    NamePasswordComponent
  ],
  imports: [
    CommonModule,
    FormUtilitiesModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    SharedComponentsModule
  ],
  exports: [
    SelectUserRoleDialogComponent,
    SendEmailComponent,
    NamePasswordComponent
  ]
})
export class CsSharedComponentsModule { }

import { NgModule }                                                                         from '@angular/core';
import { CommonModule }                                                                     from '@angular/common';
import { FgButtonsComponent }                                                               from './form-group-components/fg-form-buttons/fg-buttons.component';
import { FgInputComponent }                                                                 from './form-group-components/fg-input/fg-input.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FgButtonsSingleComponent }                                                         from './form-group-components/fg-form-buttons-single/fg-buttons-single.component';
import { FgCheckboxComponent }                                                              from './form-group-components/fg-checkbox/fg-checkbox.component';
import { InputComponent }                                                                   from './form-components/input/input.component';
import { ButtonComponent }                                                                  from './form-components/button/button.component';
import { Heading1Component }                                                                from './form-components/heading1/heading1.component';
import { Heading2Component }                                                                from './form-components/heading2/heading2.component';
import { MatProgressSpinnerModule }                                                         from '@angular/material/progress-spinner';
import { ListOfNameComponent }                                                              from './form-components/list-of-name/list-of-name.component';
import { FgTextAreaComponent }                                                              from './form-group-components/fg-textarea/fg-text-area.component';
import { CheckboxComponent } from './form-components/checkbox/checkbox.component';



@NgModule({
  declarations: [
    FgButtonsComponent,
    FgInputComponent,
    FgButtonsSingleComponent,
    FgCheckboxComponent,
    InputComponent,
    ButtonComponent,
    Heading1Component,
    Heading2Component,
    ListOfNameComponent,
    FgTextAreaComponent,
    CheckboxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  exports: [
    FgButtonsComponent,
    FgButtonsSingleComponent,
    FgInputComponent,
    FgCheckboxComponent,
    ButtonComponent,
    Heading1Component,
    Heading2Component,
    ListOfNameComponent,
    InputComponent,
    FgTextAreaComponent,
    CheckboxComponent
  ]
})
export class FormUtilitiesModule { }

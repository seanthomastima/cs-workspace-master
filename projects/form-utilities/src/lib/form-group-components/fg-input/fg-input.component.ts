import { Component, Input }                                                         from '@angular/core';
import { FormGroup }                                                                from '@angular/forms';


/**
 * Displays a label above an input text field.
 * fg, label, controlName are required.
 * inputType defaults to text, but can also be set to password or email.
 */
@Component({
  selector: 'fu-fg-input',
  templateUrl: './fg-input.component.html',
  styleUrls: []
})
export class FgInputComponent {

  @Input()
  fg:                 FormGroup;
  @Input()
  label:              string;
  @Input()
  inputType           = 'text';
  @Input()
  inputValue:         string;
  @Input()
  placeHolder:        string;
  @Input()
  controlName:        string;
  @Input()
  readOnly            = false;

  inputChanged() {

    this.fg.controls[this.controlName].patchValue(this.inputValue);

  }

  stopEnterEventBubbling(event) {

    // Stop Enter events bubbling up to Form and causing mayhem
    if (event.key === 'Enter') {

      event.stopPropagation();

    }

  }

}

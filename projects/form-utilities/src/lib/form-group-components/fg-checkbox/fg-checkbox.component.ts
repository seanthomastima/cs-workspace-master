import { Component, Input }                                                               from '@angular/core';
import { FormGroup }                                                                      from '@angular/forms';

@Component({
  selector: 'fu-fg-checkbox',
  templateUrl: './fg-checkbox.component.html',
  styleUrls: []
})
export class FgCheckboxComponent {

  @Input()
  fg:                 FormGroup;
  @Input()
  label:              string;
  @Input()
  inputValue:         boolean;
  @Input()
  controlName:        string;

  constructor() { }

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

import {Component, EventEmitter, Input, OnInit, Output }                            from '@angular/core';

export interface ControlValueChange {
  name:     string;
  value:    string;
  changed:  boolean;
}

/**
 * Displays a label above an input text field.
 * label, controlName are required.
 * inputType defaults to text, but can also be set to password or email.
 */
@Component({
  selector: 'fu-input',
  templateUrl: './input.component.html',
  styleUrls: []
})
export class InputComponent implements OnInit {

  private initialValue:  string;
  @Input()
  label:              string;
  @Input()
  inputType           = 'text';
  @Input()
  value:              string;
  @Input()
  placeHolder:        string;
  @Input()
  controlName:        string;
  @Input()
  readOnly            = false;
  @Output()
  changes             = new EventEmitter<ControlValueChange>();

  ngOnInit() {

    if (!!this.value) {

      this.initialValue = this.value.trim();

    }

    this.changes.emit(undefined);

  }

  valueChanged() {

    const valueChanged = this.value.trim() !== this.initialValue;

    this.changes.emit(
      {
        name:   this.controlName,
        value:  this.value.trim(),
        changed:  valueChanged
      });
  }

  stopEnterEventBubbling(event) {

    // Stop Enter events bubbling up to Form and causing mayhem
    if (event.key === 'Enter') {

      event.stopPropagation();

    }

  }

}

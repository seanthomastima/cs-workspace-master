import { Component, EventEmitter, Input, OnInit, Output }                                           from '@angular/core';

interface ControlValueChange {
  name:     string;
  value:    boolean;
  changed:  boolean;
}

@Component({
  selector: 'fu-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: []
})
export class CheckboxComponent implements OnInit {

  private initialValue:  boolean;
  @Input()
  label:              string;
  @Input()
  value:              boolean;
  @Input()
  controlName:        string;
  @Input()
  readOnly            = false;
  @Output()
  changes             = new EventEmitter<ControlValueChange>();

  ngOnInit() {

    if (!!this.value) {

      this.initialValue = this.value;

    }

    this.changes.emit(undefined);

  }

  valueChanged() {

    const valueChanged = this.value !== this.initialValue;

    this.changes.emit(
      {
        name:     this.controlName,
        value:    this.value,
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

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output }                        from '@angular/core';
import { Subject }                                                                          from 'rxjs';
import { ControlValueChange }                                                               from 'form-utilities';

export class ScFormControls {
  label             = '';
  name              = '';
  placeHolder       = '';
  controlType       = '';
  value             = '';
}

@Component({
  selector: 'sc-generic-form',
  templateUrl: './generic-form.component.html',
  styleUrls: []
})
export class GenericFormComponent implements OnInit, OnDestroy {

  formChanged                 = false;
  originalValues:             ScFormControls[] = [];
  changedValues:              ControlValueChange[] = [];
  destroy$                    = new Subject();
  @Input()
  heading                     = '';
  @Input()
  saveFunction:               (changes: any) => void;
  @Input()
  cancelFunction:             () => void;
  @Input()
  formControls:               ScFormControls[] = [];
  @Input()
  readOnly                    = false;
  @Input()
  showCloseButton             = true;
  @Input()
  errorMessages:              string[] = [];
  @Input()
  waiting                     = false;
  @Output()
  changed                     = new EventEmitter<boolean>();

  ngOnInit() {

    // Store originalValues passed in via formControls
    this.originalValues = JSON.parse(JSON.stringify(this.formControls));

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  cancel() {

    // Return formControls to original values
    this.formControls = JSON.parse(JSON.stringify(this.originalValues));

    // Reset form state to no changes
    this.changedValues = [];
    this.formChanged = false;

    // Call external cancelFunction
    this.cancelFunction();

  }

  // Called from control
  changedControlValue(controlValueChange: ControlValueChange) {

    this.updateChangeList(controlValueChange);

  }

  updateChangeList(controlValueChange: ControlValueChange) {

    if (controlValueChange === undefined) {

      // If undefined passed through then reset changedValues, as controls have been reset
      this.changedValues = [];

    } else {

      // If this control is in changedValues remove it
      const index = this.changedValues.findIndex(change => change.name === controlValueChange.name);

      if (index >= 0) {

        this.changedValues.splice(index, 1);

      }

      // Add new change to changedValues, if there is a change
      if (controlValueChange.changed) {

        this.changedValues.push(controlValueChange);

      }

    };

    // Update formChanged state and emit changes back to calling component
    setTimeout(() => {

      this.formChanged = this.changedValues.length > 0;

      this.changed.emit(this.formChanged);

    });

  }

}

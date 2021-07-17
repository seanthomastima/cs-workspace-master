import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup }                                                                       from '@angular/forms';

interface FormValues {
  name:           string;
  password:       string
}

@Component({
  selector: 'cs-name-password',
  templateUrl: './name-password.component.html',
  styleUrls: []
})
export class NamePasswordComponent implements OnInit{

  @Input()
  name                        = '';
  errorMessages:              string[] = [];
  fg:                         FormGroup;
  @Output()
  formValues                  = new EventEmitter<FormValues>();

  constructor(private fb:                               FormBuilder,
              private changeDetectorRef:                ChangeDetectorRef) {

    this.fg = this.fb.group({
      name:               [],
      password1:          [],
      password2:          [],
    });

  }

  ngOnInit() {

    console.log('name', this.name);

    this.fg.controls['name'].patchValue(this.name);

  }

  close() {

    if (this.validEntries()) {

      const result = {
        name:               this.fg.controls['name'].value.trim(),
        password:           this.fg.controls['password1'].value.trim(),
      };

      this.formValues.emit(result);

    }

  }

  cancel() {

    this.formValues.emit(null);

  }

  validEntries(): boolean {

    this.errorMessages = [];

    let result = true;

    if (!this.fg.controls['name'].value || !this.fg.controls['name'].value.trim()) {
      result = false;
      this.errorMessages.push('Name field cannot be empty');
    }

    if (!this.fg.controls['password1'].value || !this.fg.controls['password2'].value ||
      !this.fg.controls['password1'].value.trim() || !this.fg.controls['password2'].value.trim()) {
      result = false;
      this.errorMessages.push('Password field cannot be empty');
    } else {
      if (this.fg.controls['password1'].value.trim() !== this.fg.controls['password2'].value.trim()) {
        result = false;
        this.errorMessages.push('Passwords do not match');
      }
    }

    this.changeDetectorRef.detectChanges(); // Necessary or form will not display if called from RXJS pipe

    return result;

  }

}

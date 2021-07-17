import { Component, EventEmitter, Input, OnInit, Output }                                               from '@angular/core';
import { FormBuilder, FormGroup }                                                                       from '@angular/forms';

interface FormValues {
  name:           string;
  emailAddress:   string;
  password:       string
}

@Component({
  selector: 'add-user',
  templateUrl: './add-user.component.html',
  styleUrls: []
})
export class AddUserComponent implements OnInit {
  @Input()
  heading:                    string;
  @Output()
  formValues                  = new EventEmitter<FormValues>();
  errorMessages:              string[] = [];
  fg:                         FormGroup;

  constructor(private fb:                           FormBuilder) {

    this.fg = this.fb.group({
      name:               [],
      emailAddress:       [],
      password1:          [],
      password2:          [],
    });

  }

  ngOnInit() {}

  save() {

    if (this.validEntries()) {

      const result = {
        name:               this.fg.controls['name'].value.trim(),
        emailAddress:       this.fg.controls['emailAddress'].value.trim(),
        password:           this.fg.controls['password1'].value.trim(),
        mustResetPassword:  !!this.fg.controls['mustResetPassword'] ? this.fg.controls['mustResetPassword'].value : false,
        active:             !!this.fg.controls['active'] ? this.fg.controls['active'].value : false,
      };

      this.formValues.emit(result);

    }

  }

  cancel() {

    this.formValues.emit(undefined);

  }

  validEntries(): boolean {

    this.errorMessages = [];

    let result = true;

    if (!this.fg.controls['name'].value || !this.fg.controls['name'].value.trim()) {
      result = false;
      this.errorMessages.push('Name field cannot be empty');
    }

    if (!this.fg.controls['emailAddress'].value || !this.fg.controls['emailAddress'].value.trim()) {
      result = false;
      this.errorMessages.push('Email address field cannot be empty');
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

    return result;
  }

}

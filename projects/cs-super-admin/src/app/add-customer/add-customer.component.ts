import { Component, EventEmitter, Output }                                                            from '@angular/core';
import { FormBuilder, FormGroup }                                                                     from '@angular/forms';

interface FormValues {
  name:                 string;
  description:          string;
  customerSignInKey:    string
  active:               boolean
}

@Component({
  selector: 'add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: []
})
export class AddCustomerComponent {
  @Output()
  formValues                  = new EventEmitter<FormValues>();
  errorMessages:              string[] = [];
  fg:                         FormGroup;

  constructor(private fb:                           FormBuilder) {

    this.fg = this.fb.group({
      name:                 [],
      description:          [],
      customerSignInKey:    [],
      active:               []
    });

  }

  save() {

    if (this.validEntries()) {

      const result = {
        name:                     this.fg.controls['name'].value.trim(),
        description:              this.fg.controls['description'].value.trim(),
        customerSignInKey:        this.fg.controls['customerSignInKey'].value.trim(),
        active:                   this.fg.controls['active'].value
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

    if (!this.fg.controls['description'].value || !this.fg.controls['description'].value.trim()) {
      result = false;
      this.errorMessages.push('Description field cannot be empty');
    }

    if (!this.fg.controls['customerSignInKey'].value || !this.fg.controls['customerSignInKey'].value.trim()) {
      result = false;
      this.errorMessages.push('Customer SignInKey field cannot be empty');
    }

    return result;
  }

}

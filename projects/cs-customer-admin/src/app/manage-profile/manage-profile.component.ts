import { Component, EventEmitter, Input, OnInit, Output }                                               from '@angular/core';
import { FormBuilder, FormGroup }                                                                       from '@angular/forms';
import { Administrator }                                                                                from 'cs-shared-components';

interface FormValues {
  name:           string;
  emailAddress:   string;
  password:       string;
  selectedTab:    string;
}

@Component({
  selector: 'manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: []
})
export class ManageProfileComponent implements OnInit {
  @Input()
  user:                       Administrator;
  @Output()
  formValues                  = new EventEmitter<FormValues>();
  selectedTab                 = 'USER_DETAILS';
  errorMessages:              string[] = [];
  fg:                         FormGroup;

  constructor(private fb:                           FormBuilder) {

    this.fg = this.fb.group({
      name:               [''],
      emailAddress:       [''],
      password1:          [''],
      password2:          ['']
    });

  }

  ngOnInit() {

    if (this.user) {
      this.fg.patchValue({
        name:           this.user.name,
        emailAddress:   this.user.emailAddress,
      });
    }

  }

  setSelectedTab(tabSelection) {

    this.selectedTab = tabSelection;

  }

  save() {

    if (this.validEntries()) {
      const result = {
        name:           this.fg.controls['name'].value.trim(),
        emailAddress:   this.fg.controls['emailAddress'].value.trim(),
        password:       this.fg.controls['password1'].value.trim(),
        selectedTab:    this.selectedTab
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

    if (this.selectedTab === 'USER_DETAILS') {

      // Check User Details
      if (!this.fg.controls['name'].value || !this.fg.controls['name'].value.trim()) {
        result = false;
        this.errorMessages.push('Name field cannot be empty');
      }

      if (!this.fg.controls['emailAddress'].value || !this.fg.controls['emailAddress'].value.trim()) {
        result = false;
        this.errorMessages.push('Email address field cannot be empty');
      }

    } else {

      // Check Passwords
      if (!this.fg.controls['password1'].value.trim() || !this.fg.controls['password2'].value.trim() ||
          this.fg.controls['password1'].value.trim().length < 6) {
        result = false;
        this.errorMessages.push('Password field cannot be empty and must be at least six characters');
      } else {
        if (this.fg.controls['password1'].value.trim() !== this.fg.controls['password2'].value.trim()) {
          result = false;
          this.errorMessages.push('Passwords do not match');
        }
      }

    }

    return result;
  }

}

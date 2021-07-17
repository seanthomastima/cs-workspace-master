import { Component, EventEmitter, OnInit, Output }                                                    from '@angular/core';
import { FormBuilder, FormGroup }                                                                     from '@angular/forms';
import { AuthService }                                                                                from '../model/services/auth.service';
import { MatSnackBar }                                                                                from '@angular/material/snack-bar';
import { FormUtilitiesSingleService }                                                                 from 'form-utilities';

interface FormValues {
  password1:   string;
  password2:   string
}

@Component({
  selector: 'update-password',
  providers: [FormUtilitiesSingleService],
  templateUrl: './update-password.component.html',
  styleUrls: []
})
export class UpdatePasswordComponent implements OnInit {
  @Output()
  passwordUpdated             = new EventEmitter<boolean>();

  constructor(public fuService:                     FormUtilitiesSingleService<FormValues>,
              private fb:                           FormBuilder,
              private authService:                  AuthService,
              private snackBar:                     MatSnackBar) {

    const fg = this.fb.group({
      password1:          [''],
      password2:          ['']
    });

    this.fuService.fg = fg;

    this.fuService.updateItemFromFG = (item: FormValues, formGroup: FormGroup) => {
      item.password1                = formGroup.controls['password1'].value.trim();
      item.password2                = formGroup.controls['password2'].value.trim();
    };

    this.fuService.updateFGFromItem = (item: FormValues, formGroup: FormGroup) => {
      formGroup.patchValue({
        password1:                  item.password1,
        password2:                  item.password2
      });
    };

  }

  ngOnInit() {

    this.fuService.setItem({
      password1: '',
      password2: ''
    });

  }

  save() {

    if (!this.validInput()) {

      return;

    }

    this.authService.updatePassword(this.fuService.item.password1)
      .then(() => {

        this.snackBar.open('Password updated.', '', {
          duration: 3000
        });

        this.passwordUpdated.emit(true);

      })
      .catch(err => this.fuService.errorMessages.push(err.message));

  }

  cancel() {

    this.passwordUpdated.emit(false);

  }

  validInput(): boolean {

    this.fuService.errorMessages = [];

    let result = true;

    if (!this.fuService.item.password1 || !this.fuService.item.password2 ||
      !this.fuService.item.password1.trim() || !this.fuService.item.password2.trim()) {
      result = false;
      this.fuService.errorMessages.push('Password field cannot be empty');
    } else {
      if (this.fuService.item.password1.trim() !== this.fuService.item.password2.trim()) {
        result = false;
        this.fuService.errorMessages.push('Passwords do not match');
      }
    }

    return result;

  }

}

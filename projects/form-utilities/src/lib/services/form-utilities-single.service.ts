import { Injectable }                                                                                         from '@angular/core';
import { FormGroup }                                                                                          from '@angular/forms';
import { MatSnackBar }                                                                                        from '@angular/material/snack-bar';
import clone                                                                                                  from 'lodash/clone';
import isEqual                                                                                                from 'lodash/isEqual';
import { PageStateOptions }                                                                                   from "../general/page-state-options";

@Injectable({
  providedIn: 'root'
})
export class FormUtilitiesSingleService<T> {
  pageStateOptions                = PageStateOptions;
  pageState: PageStateOptions     = this.pageStateOptions.VIEW;
  changes                         = false;
  errorMessages:                  string[] = [];
  item:                           T;
  originalItem:                   T;
  private formGroup:              FormGroup;
  updateItemFromFG:               (item: T, formGroup: FormGroup) => void;
  updateFGFromItem:               (item: T, formGroup: FormGroup) => void;
  externalSave:                   () => void;

  constructor(private snackBar:                   MatSnackBar) { }

  init() {

    this.pageState = this.pageStateOptions.VIEW;

  }

  set fg(fg: FormGroup) {

    this.formGroup = fg;

    this.trackChanges();

  }

  get fg(): FormGroup {

    return this.formGroup;

  }

  setItem(item: T) {

    this.item = item;

    this.originalItem = clone(this.item);

    this.changes = false;

    this.updateFGFromItem(item, this.formGroup);

  }

  cancel() {

    this.setItem(this.originalItem);

    this.errorMessages = [];

  }

  addErrorMessage(error: string) {

    this.errorMessages.push(error);

  }

  resetErrorDisplay() {

    this.errorMessages = [];

    this.pageState = this.pageStateOptions.VIEW;
  }

  setPageState(state: PageStateOptions) {

    this.pageState = state;

  }

  private trackChanges() {

    const sub = this.formGroup.valueChanges
      .subscribe(() => {
        setTimeout(() => {
          this.updateItemFromFG(this.item, this.formGroup);
          this.changes = !isEqual(this.item, this.originalItem);
        });
      });

  }

  openSnackBar(message: string) {

    this.snackBar.open(message, '', {
      duration: 2000,
    });

  }

}

import { Injectable }                                                                         from '@angular/core';
import { FormGroup }                                                                          from '@angular/forms';
import clone                                                                                  from 'lodash/clone';
import isEqual                                                                                from 'lodash/isEqual';
import { MatSnackBar }                                                                        from '@angular/material/snack-bar';
import { PageStateOptions }                                                                   from '../general/page-state-options';

@Injectable({
  providedIn: 'root'
})
export class FormUtilitiesService<T> {
  pageStateOptions                = PageStateOptions;
  pageState                       = this.pageStateOptions.VIEW;
  itemChanged                     = false;          // True if item !== originalItem
  externalChanges:                string[] = [];    // If there are state changes external to this service they can be listed here
  panelOpen                       = false;
  errorMessages:                  string[] = [];
  item:                           T;
  originalItem:                   T;
  items:                          T[] = [];         // Client should use this list if not filtering
  filter                          = '';
  filteredItems:                  T[] = [];         // Client should use this list if filtering
  private formGroup:              FormGroup;
  updateItemFromFG:               (item: T, formGroup: FormGroup) => void;  // Passed in by client
  updateFGFromItem:               (item: T, formGroup: FormGroup) => void;  // Passed in by client
  externalSave:                   () => void;       // Passed in by client
  externalDelete:                 () => void;       // Passed in by client
  filterList:                     (filter: string, list: T[], filteredList: T[]) => T[];    // Passed in by client


  constructor(private snackBar:                   MatSnackBar) { }

  set fg(fg: FormGroup) {

    this.formGroup = fg;

    this.trackFGChanges();

  }

  get fg(): FormGroup {

    return this.formGroup;

  }

  /**
   * This method is called when the client initiates the creation of a new item.
   * The form state, items and filteredItems are updated.
   */
  addNew(newItem: T) {

    this.item = newItem;

    this.itemChanged = false;

    this.panelOpen = true;

    this.pageState = this.pageStateOptions.ADD;

    this.updateFGFromItem(this.item, this.formGroup);

    this.originalItem = JSON.parse(JSON.stringify(this.item));

    this.items.push(this.item);

    this.filteredItems.push(this.item);

    // Copy items and filteredItems so that they get a fresh reference - required to trigger updates when lists displayed in virtual-scroll-viewport
    this.items          = clone(this.items);
    this.filteredItems  = clone(this.filteredItems);

  }

  /**
   * This method returns the form to the pre edit or add state.
   * If selectionChanged is true, then the form is put into edit state.
   */
  cancel(selectionChanged: boolean = false) {

    setTimeout(() => {

      this.itemChanged = false;
      this.panelOpen = false;
      this.resetExternalChanges();

      if (this.pageState === this.pageStateOptions.ADD) {

        // Was adding a new item, so now remove this item from items.
        this.items.splice(this.items.indexOf(this.item), 1);
        // Copy items and filteredItems so that they get a fresh reference - required to trigger updates when lists displayed in virtual-scroll-viewport
        this.items          = clone(this.items);
        this.filteredItems  = clone(this.items);

      }

      // Create newItem from this.item, but with blank FSKey so selection is reset in template
      const newItem = clone(this.item);
      newItem.FSKey = '';

      if (selectionChanged) {
        this.pageState = this.pageStateOptions.EDIT;
      } else {
        setTimeout(() => {
          this.pageState = this.pageStateOptions.VIEW;
        });
      }

      this.item = JSON.parse(JSON.stringify(newItem));

      this.originalItem = JSON.parse(JSON.stringify(newItem));

      this.updateFGFromItem(newItem, this.formGroup);

      this.errorMessages = [];

    });

  }

  /**
   * Puts the form into edit state, if in view state or selectionChanged.
   * Read below for management of event bubbling.
   */
  edit(editedItem: T, selectionChanged: boolean = false) {

    // Don't update if already in ADD or EDIT mode
    // This can happen due to event bubbling if the "edit" method is called from the header in the template
    // Calling from the header gives the Administrator a larger "click" target and is easier to use.
    // If a new item is selected then selectionChanged should be true.
    if (this.pageState === this.pageStateOptions.VIEW || selectionChanged) {

      this.itemChanged = false;

      this.updateFGFromItem(editedItem, this.formGroup);

      // Switch to EDIT mode if not adding new Product
      setTimeout(() => {
        this.pageState = this.pageStateOptions.EDIT;
      });

      this.item         = JSON.parse(JSON.stringify(editedItem));

      this.originalItem = JSON.parse(JSON.stringify(editedItem));

      this.panelOpen = true;

    }

  }

  addErrorMessage(error: string) {

    setTimeout(() => {
      this.errorMessages.push(error);
    });

  }

  setPageState(state: PageStateOptions) {

    setTimeout(() => {
      this.pageState = state;
    });

  }

  updateFilteredList() {

    this.filteredItems = this.filterList(this.filter, this.items, this.filteredItems);

  }

  addExternalChange(change: string) {

    const index = this.externalChanges.indexOf(change);

    if (index < 0) {
      this.externalChanges.push(change);
    }

  }

  removeExternalChange(change: string) {

    const index = this.externalChanges.indexOf(change);

    if (index >= 0) {
      this.externalChanges.splice(index, 1);
    }

  }

  private resetExternalChanges() {

    this.externalChanges = [];

  }

  updateItemChanged() {

    this.setItemChanged();

  }

  private trackFGChanges() {

    const sub = this.formGroup.valueChanges
      .subscribe(() => {
        setTimeout(() => {
          this.setItemChanged();
        });
      });

  }

  private setItemChanged() {

    this.updateItemFromFG(this.item, this.formGroup);
    this.itemChanged = !isEqual(this.item, this.originalItem) || this.externalChanges.length > 0;

  }

  openSnackBar(message: string) {

    this.snackBar.open(message, '', {
      duration: 2000,
    });

  }

}


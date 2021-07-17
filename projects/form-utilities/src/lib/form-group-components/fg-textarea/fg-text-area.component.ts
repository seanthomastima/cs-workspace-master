import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import { FormGroup }                                                                              from '@angular/forms';

@Component({
  selector: 'fu-fg-textarea',
  templateUrl: './fg-text-area.component.html',
  styleUrls: []
})
export class FgTextAreaComponent {

  @ViewChild('textarea') textArea:         ElementRef;
  @Input()
  fg:                 FormGroup;
  @Input()
  label:              string;
  @Input()
  inputValue:         string;
  @Input()
  readonly            = false;
  @Input()
  placeHolder:        string;
  @Input()
  controlName:        string;

  inputChanged(event) {

    this.stopEnterEventBubbling(event);

    this.fg.controls[this.controlName].patchValue(this.textArea.nativeElement.value);

  }

  stopEnterEventBubbling(event) {

    // Stop Enter events bubbling up to Form and causing mayhem
    if (event.key === 'Enter') {

      event.stopPropagation();

    }

  }

}

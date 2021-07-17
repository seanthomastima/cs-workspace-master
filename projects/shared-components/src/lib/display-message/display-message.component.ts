import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sc-display-message',
  templateUrl: './display-message.component.html',
  styleUrls: []
})
export class DisplayMessageComponent {

  @Input()
  message:                    string;
  @Input()
  isErrorMessage              = false;
  @Output()
  OK                          = new EventEmitter<undefined>();

  constructor() { }

  close() {

    this.OK.emit(undefined);

  }

}

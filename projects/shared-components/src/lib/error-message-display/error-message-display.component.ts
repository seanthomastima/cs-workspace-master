import { Component, OnInit, Input } from '@angular/core';


/**
 * Displays a vertical list of error messages
 */
@Component({
  selector: 'sc-error-message',
  templateUrl: './error-message-display.component.html',
  styleUrls: []
})
export class ErrorMessageDisplayComponent implements OnInit {

  @Input()
  errorMessages:        string[] =[];

  constructor() { }

  ngOnInit(): void {
  }

}

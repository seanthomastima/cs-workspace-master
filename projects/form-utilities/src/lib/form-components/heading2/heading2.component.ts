import { Component, Input }                                                                             from '@angular/core';

@Component({
  selector: 'fu-heading2',
  templateUrl: './heading2.component.html',
  styleUrls: []
})
export class Heading2Component  {

  @Input()
  text:              string;


}

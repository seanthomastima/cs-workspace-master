import { Component, Input }                                                                               from '@angular/core';

@Component({
  selector: 'fu-heading1',
  templateUrl: './heading1.component.html',
  styleUrls: []
})
export class Heading1Component {

  @Input()
  text:              string;

}

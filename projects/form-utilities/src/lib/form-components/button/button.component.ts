import { Component, Input }                                                                       from '@angular/core';

@Component({
  selector: 'fu-button',
  templateUrl: './button.component.html',
  styleUrls: []
})
export class ButtonComponent {

  @Input()
  label:              string;

}

import { Component, Input }                                                         from '@angular/core';
import { FormUtilitiesService }                                                     from '../../services/form-utilities.service';


@Component({
  selector: 'fu-fg-buttons',
  templateUrl: './fg-buttons.component.html',
  styleUrls: []
})
export class FgButtonsComponent {

  @Input()
  fuService: FormUtilitiesService<any>;

  constructor() { }

}

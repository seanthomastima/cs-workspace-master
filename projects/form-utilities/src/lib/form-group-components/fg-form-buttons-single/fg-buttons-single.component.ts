import { Component, Input }                                                             from '@angular/core';
import { FormUtilitiesSingleService }                                                   from "../../services/form-utilities-single.service";

@Component({
  selector: 'fu-fg-buttons-single',
  templateUrl: './fg-buttons-single.component.html',
  styleUrls: []
})
export class FgButtonsSingleComponent {

  @Input()
  fuService: FormUtilitiesSingleService<any>;

  constructor() { }

}

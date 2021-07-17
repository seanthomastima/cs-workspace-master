import { Component, Input }                                                                     from '@angular/core';

interface ListItem {
  name: string;
}

@Component({
  selector: 'fu-list-of-name',
  templateUrl: './list-of-name.component.html',
  styleUrls: []
})
export class ListOfNameComponent {

  @Input()
  listOfNames:      ListItem[];

}

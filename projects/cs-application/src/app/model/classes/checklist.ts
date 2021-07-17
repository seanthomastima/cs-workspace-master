export interface ChecklistItem {
  FSKey:                  string;
  name:                   string;
  description:            string;
  canCompleteRoleFSKeys:  string[];
}

export class Checklist {
  public FSKey:                   string;
  public name                     = '';
  public description              = '';
  public owningRoleFSKey:         string;
  public checklistItems:          ChecklistItem[] = [];
  public sharedWithRoleFSKeys:    string[] = [];
  public createdTimeStamp:        number;

  static fromJsonList(array: any): Checklist[] {

    return array.map(Checklist.fromJson);

  }

  static fromJson(checklist: {
    FSKey,
    name,
    description,
    owningRoleFSKey,
    checklistItems,
    sharedWithRoleFSKeys,
    createdTimeStamp,
  }) {

    return checklist;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }

  public JSONtoChecklistItems(items): ChecklistItem[] {

    const checklistItems = [];

    items.map(item => {

      const checklistItem: ChecklistItem = {
        FSKey:                  item.FSKey,
        name:                   item.name,
        description:            item.description,
        canCompleteRoleFSKeys:  []
      };

    });

    return checklistItems;

  }

}

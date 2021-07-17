export class Team {
  public FSKey:                           string;
  public name                             = '';
  public description                      = '';
  public owningRoleFSKey:                 string;
  public teamMemberRoleFSKeys:            string[] = [];
  public createdTimeStamp:                number;

  static fromJsonList(array: any): Team[] {

    return array.map(Team.fromJson);

  }

  static fromJson(team: {
    FSKey,
    name,
    description,
    owningRoleFSKey,
    teamMemberRoleFSKeys,
    createdTimeStamp
  }): Team {

    return team;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }

}

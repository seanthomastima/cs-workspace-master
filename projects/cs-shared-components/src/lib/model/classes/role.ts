export class Role {
  public FSKey:                   string;
  public name                     = '';
  public ownerFSKey               = '';
  public managingRoleFSKey        = '';
  public hasTeam                  = false;
  public teamFSKey                = '';
  public hasChecklists            = false;
  public teamMembershipFSKeys:    string[]; // Teams this Role is a member of
  public active                   = false;
  public createdTimeStamp:        number;

  static fromJsonList(array: any): Role[] {

    return array.map(Role.fromJson);

  }

  static fromJson(role: {
    FSKey,
    name,
    ownerFSKey,
    managingRoleFSKey,
    hasTeam,
    teamFSKey,
    hasChecklists,
    teamMembershipFSKeys,
    active,
    createdTimeStamp
  }): Role {

    return role;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }
}

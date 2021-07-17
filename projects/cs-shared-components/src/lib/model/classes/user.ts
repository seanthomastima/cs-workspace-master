export class User {
  public FSKey:                           string;
  public name                             = '';
  public emailAddress                     = '';
  public roleFSKeys:                      string[];
  public customerFSKey                    = '';
  public mustResetPassword                = true;
  public active                           = true;
  public createdTimeStamp:                number;

  static fromJsonList(array: any): User[] {

    return array.map(User.fromJson);

  }

  static fromJson(user: {
    FSKey,
    name,
    emailAddress,
    roleFSKeys,
    customerFSKey,
    mustResetPassword,
    active,
    createdTimeStamp,
  }): User {

    return user;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }

}

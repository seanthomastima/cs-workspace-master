/**
 * The Administrator class is used both for the SuperAdministrators and the Customer Administrators.
 */
export class Administrator {
  public FSKey:                           string;  // UUID
  public name:                            string;
  public emailAddress:                    string;
  public customerFSKey                    = '';

  static fromJsonList(array: any): Administrator[] {
    return array.map(Administrator.fromJson);
  }

  static fromJson({ FSKey,
                    name,
                    emailAddress,
                    customerFSKey
                  }: {

    FSKey:              string,
    name:               string,
    emailAddress:       string,
    customerFSKey:      string}): Administrator {

    const newObject = new Administrator();

    newObject.FSKey                   = FSKey;
    newObject.name                    = name;
    newObject.emailAddress            = emailAddress;
    newObject.customerFSKey           = customerFSKey;

    return newObject;

  }

  constructor() {}

}

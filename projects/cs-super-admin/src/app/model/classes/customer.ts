export class Customer {
  public FSKey:                           string;
  public name                             = '';
  public description                      = '';
  public customerSignInKey                = '';
  public active                           = true;
  public createdTimeStamp:                number;

  static fromJsonList(array: any): Customer[] {
    return array.map(Customer.fromJson);
  }

  static fromJson(customer: {
    FSKey,
    name,
    description,
    customerSignInKey,
    active,
    createdTimeStamp,
  }): Customer {

    return customer;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }
}

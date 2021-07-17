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

  static fromJson({ FSKey,
                    name,
                    description,
                    customerSignInKey = '',
                    active,
                    createdTimeStamp,
                  }: Customer): Customer {

    const newCustomer = new Customer();

    newCustomer.FSKey                   = FSKey;
    newCustomer.name                    = name;
    newCustomer.description             = description;
    newCustomer.customerSignInKey       = customerSignInKey;
    newCustomer.active                  = active;
    newCustomer.createdTimeStamp        = createdTimeStamp;

    return newCustomer;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }

}

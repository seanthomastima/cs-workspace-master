import { LocalDataService }                                                                     from '../services/local-data.service';
import { Administrator, Customer }                                                              from 'cs-shared-components';

export class SignInContext {
  signedIn      = false;

  constructor(
    public customer:            Customer,
    public administrator:       Administrator,
    public localDataService?:   LocalDataService) {

    this.signedIn = !!administrator;

  }

}

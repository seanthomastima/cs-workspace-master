import { LocalDataService }                                                                       from '../services/local-data.service';
import { Customer, User }                                                                         from 'cs-shared-components';

export class SignInContext {
  signedIn      = false;

  constructor(public customer:              Customer,
              public user:                  User,
              public localDataService?:     LocalDataService) {

    this.signedIn = !!user;

  }

}

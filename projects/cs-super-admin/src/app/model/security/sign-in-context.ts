import { Administrator }                                                                              from 'cs-shared-components';

export class SignInContext {
  signedIn      = false;

  constructor(public administrator:     Administrator) {

    this.signedIn = !!administrator;

  }

}

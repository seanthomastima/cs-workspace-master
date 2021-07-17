import { Injectable }                                                                             from '@angular/core';
import { FS }                                                                                     from '../firestore-constants';
import { map, switchMap, tap }                                                                    from 'rxjs/operators';
import { Observable, of }                                                                         from 'rxjs';
import { AngularFirestore }                                                                       from '@angular/fire/firestore';
import { Customer, User }                                                                         from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(private afs: AngularFirestore) { }

  getCustomerFromSignInKey(customerSignInKey: string): Observable<Customer> {

    const path = `${FS.Customers}`;

    return this.afs.collection(path,
      ref => ref.where('customerSignInKey', '==', customerSignInKey)
    )
      .valueChanges()
      .pipe(
        map((customers: Customer[]) => {

          if (customers.length > 0) {
            return customers[0];
          } else {
            return undefined;
          }

        })
      );

  }

  /**
   * This method presumes that each User FSKey is only associated with ONE Customer
   *
   * If a person wishes to be a User of more than one Customer then they must have a separate email address and therefore a separate Google
   * Authenticated User for each Customer
   */
  getCustomerFromUserFSKey(userFSKey: string): Observable<Customer> {

    return this.afs.collectionGroup(
      FS.Users,
      ref => ref.where('FSKey', '==', userFSKey)
    )
      .valueChanges()
      .pipe(
        map((users: User[]) => {

          if (users.length > 0) {
            return users[0];
          } else {
            return undefined;
          }

        }),
        switchMap(user => {

          if(!!user) {
            return this.getCustomerFromFSKey(user.customerFSKey);
          } else {
            return of(undefined);
          }
        })
      );

  }

  getCustomerFromFSKey(customerFSKey: string): Observable<Customer> {

    const path = `${FS.Customers}/${customerFSKey}`;

    return this.afs.doc(path)
      .valueChanges()
      .pipe(
        map(Customer.fromJson)
      )

  }

}

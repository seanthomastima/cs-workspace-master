import { Injectable }                                                                             from '@angular/core';
import { AngularFirestore }                                                                       from '@angular/fire/firestore';
import {flatMap, map, switchMap, tap} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';
import { Administrator, Customer }                                                                from 'cs-shared-components';
import { FS }                                                                                     from '../../../../../shared-files/firestore-constants';
import { FirestoreUtilsService }                                                                  from 'shared-components';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private afs:                        AngularFirestore,
              private firestoreUtilsService:      FirestoreUtilsService) { }

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

  getCustomerFromFSKey(customerFSKey: string): Observable<Customer> {

    const path = `${FS.Customers}/${customerFSKey}`;

    return this.afs.doc(path)
      .valueChanges()
      .pipe(
        map(Customer.fromJson)
      )

  }

  getCustomerFromUserFSKey(userFSKey: string): Observable<Customer> {

    return this.afs.collectionGroup(
      FS.CustomerAdministrators,
      ref => ref.where('FSKey', '==', userFSKey)
    )
      .valueChanges()
      .pipe(
        flatMap((administrators: Administrator[]) => {

          if (administrators.length > 0) {

            return this.getCustomerFromFSKey(administrators[0].customerFSKey);

          } else {

            return of(undefined);

          }

        })
      );

  }

  userIsCustomerAdministrator(customerFSKey: string, userFSKey: string): Observable<boolean> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.CustomerAdministrators}/${userFSKey}`;

    return this.firestoreUtilsService.documentExists(this.afs, path);

  }

  setUserAsCustomerAdministrator(customerFSKey: string, userFSKey: string): Observable<any>{

    const path = `${FS.Customers}/${customerFSKey}/${FS.CustomerAdministrators}`;

    const admin = {
      FSKey: userFSKey,
      customerFSKey
    };

    return this.firestoreUtilsService.documentExists(this.afs, `path/${userFSKey}`)
      .pipe(
        map(exists => {

              exists ?
              this.firestoreUtilsService.update(this.afs, path, userFSKey, admin) :
              this.firestoreUtilsService.addToCollection(this.afs, path, userFSKey, admin);

          }
        )
      );

  }

  getAdministratorsForCustomer(FSKey: string): Observable<Administrator[]> {

    const path = `${FS.Customers}/${FSKey}/administrators`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Administrator.fromJsonList)
      );

  }

}

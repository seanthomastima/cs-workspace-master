import { Injectable }                                                                             from '@angular/core';
import { AngularFirestore }                                                                       from '@angular/fire/firestore';
import { first, flatMap, map }                                                                    from 'rxjs/operators';
import { Customer }                                                                               from '../classes/customer';
import { forkJoin, Observable }                                                                   from 'rxjs';
import { Administrator, User }                                                                    from 'cs-shared-components';
import { FS }                                                                                     from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  constructor(private afs: AngularFirestore) { }

  getCustomersFIRESTORE() {

    const path = `${FS.Customers}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Customer.fromJsonList)
      );

  }

  getAdministratorsForCustomer(customerFSKey: string): Observable<Administrator[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.CustomerAdministrators}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Administrator.fromJsonList),
        flatMap((admins) => {
          const resArray = [];
          admins.map(admin => resArray.push(this.getUserFromFSKey(customerFSKey, admin.FSKey)));
          return forkJoin(resArray);
        }),
        map(admins => Administrator.fromJsonList(admins)),
        map(customerAdministrators => customerAdministrators.sort((a, b) => (a.name > b.name) ? 1 : -1))
      );

  }

  getUserFromFSKey(
    customerFSKey:  string,
    FSKey:          string): Observable<User> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Users}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        first(),
        map((users: User[]) => {

          const index = users.findIndex(user => user.FSKey === FSKey);

          return users[index];

        }),
        map(User.fromJson)
      );

  }

}

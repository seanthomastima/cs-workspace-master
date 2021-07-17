import { Injectable }                                                                               from '@angular/core';
import { AngularFirestore }                                                                         from '@angular/fire/firestore';
import { map }                                                                                      from 'rxjs/operators';
import { Administrator }                                                                            from 'cs-shared-components';
import { FS }                                                                                       from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class CustomerAdministratorService {

  constructor(private afs: AngularFirestore) { }

  getCustomerAdministratorsFIRESTORE(customerFSKey: string) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.CustomerAdministrators}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Administrator.fromJsonList)
      );

  }
}

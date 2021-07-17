import { Injectable }                                                                               from '@angular/core';
import { AngularFirestore }                                                                         from '@angular/fire/firestore';
import { map }                                                                                      from 'rxjs/operators';
import { Administrator }                                                                            from 'cs-shared-components';
import { FS }                                                                                       from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class SuperAdministratorsService {

  constructor(private afs: AngularFirestore) { }

  getSuperAdministratorsFIRESTORE() {

    const path = `${FS.SuperAdministrators}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(Administrator.fromJsonList)
      );

  }
}

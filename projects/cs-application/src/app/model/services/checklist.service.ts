import { Injectable }                                                                                   from '@angular/core';
import { AngularFirestore }                                                                             from '@angular/fire/firestore';
import { Observable }                                                                                   from 'rxjs';
import { Checklist }                                                                                    from '../classes/checklist';
import { FS }                                                                                           from '../firestore-constants';
import { map }                                                                                          from 'rxjs/operators';
import { FirestoreUtilsService }                                                                        from 'shared-components';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  constructor(private afs:                    AngularFirestore,
              private fireStoreUtils:         FirestoreUtilsService) { }

  getChecklistsFIRESTORE(customerFSKey: string): Observable<Checklist[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Checklists}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(checklists => Checklist.fromJsonList(checklists))
      );

  }

  addChecklist(customerFSKey: string, checklist: Checklist) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Checklists}`;

    const docName = this.fireStoreUtils.docName();

    checklist.FSKey = docName;

    this.fireStoreUtils.addToCollection(this.afs, path, docName, checklist);

  }

  updateChecklist(customerFSKey: string, checklist: Checklist) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Checklists}`;

    this.fireStoreUtils.update(this.afs, path, checklist.FSKey, checklist);

  }

  deleteChecklist(
    customerFSKey:  string,
    checklistFSKey:      string) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.Checklists}/${checklistFSKey}`;

    this.fireStoreUtils.delete(this.afs, path);

  }

}

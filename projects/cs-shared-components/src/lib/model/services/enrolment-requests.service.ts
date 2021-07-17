import { Injectable }                                                                               from '@angular/core';
import {Observable, of} from 'rxjs';
import { map }                                                                                      from 'rxjs/operators';
import { AngularFirestore }                                                                         from '@angular/fire/firestore';
import { FirestoreUtilsService }                                                                    from 'shared-components';
import { FS }                                                                                       from '../firestore-constants';
import { EnrolmentRequest }                                                                         from '../classes/enrolment-request';

@Injectable({
  providedIn: 'root'
})
export class EnrolmentRequestsService {

  constructor(private afs:                          AngularFirestore,
              private fireStoreUtils:               FirestoreUtilsService) { }

  getEnrolmentsFIRESTORE(customerFSKey: string): Observable<EnrolmentRequest[]> {

    const path = `${FS.Customers}/${customerFSKey}/${FS.EnrolmentRequests}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(EnrolmentRequest.fromJsonList)
      );

  }

  getEnrolmentRequestByFSKey(FSKey: string): Observable<EnrolmentRequest> {

    return this.afs.collectionGroup(FS.EnrolmentRequests,
      ref => ref.where('FSKey', '==', FSKey))
      .valueChanges()
      .pipe(
        map(enrolmentRequests => enrolmentRequests[0]),
        map(EnrolmentRequest.fromJson)
      );

  }

  completeEnrolment(enrolmentRequest: EnrolmentRequest) {

    enrolmentRequest.enrolmentCompleted = true;
    enrolmentRequest.enrolmentCompletedTimeStamp = Date.now();

    const path = `${FS.Customers}/${enrolmentRequest.customerFSKey}/${FS.EnrolmentRequests}`;

    this.fireStoreUtils.update(this.afs, path, enrolmentRequest.FSKey, enrolmentRequest);

  }

  deleteEnrolmentRequest(
    customerFSKey:            string,
    enrolmentRequestFSKey:    string) {

    const path = `${FS.Customers}/${customerFSKey}/${FS.EnrolmentRequests}/${enrolmentRequestFSKey}`;

    this.fireStoreUtils.delete(this.afs, path);

  }

}

import { Injectable }                                                                                 from '@angular/core';
import { FirestoreUtilsService }                                                                      from 'shared-components';
import { AngularFirestore }                                                                           from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private afs:                          AngularFirestore,
              private firestoreUtilsService:        FirestoreUtilsService) { }

  sendEmail(
    recipient:    string,
    subject:      string,
    body:         string) {

    console.log('sent: ' + recipient);

    const mailObj = {
      to: recipient,
      message: {
        subject,
        html: body,
      }
    };

    const docName = this.firestoreUtilsService.docName();

    this.firestoreUtilsService.addToCollection(this.afs, 'mail', docName, mailObj);

  };

}


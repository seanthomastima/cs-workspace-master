import { Injectable }                                                                             from '@angular/core';
import { AngularFirestore }                                                                       from '@angular/fire/firestore';
import { first, map }                                                                             from 'rxjs/operators';
import { EmailTemplate }                                                                          from '../classes/email-template';
import { FirestoreUtilsService }                                                                  from 'shared-components';
import { Observable }                                                                             from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  constructor(private afs:                        AngularFirestore,
              private firestoreUtilsService:      FirestoreUtilsService) { }

  getEmailTemplatesFIRESTORE(FS) {

    const path = `${FS.EmailTemplates}`;

    return this.afs.collection(path)
      .valueChanges()
      .pipe(
        map(EmailTemplate.fromJsonList)
      );

  }

  getEmailTemplateByName(emailTemplate$: Observable<EmailTemplate[]>, name: string): Observable<EmailTemplate> {

      return emailTemplate$
        .pipe(
          first(),
          map(emailTemplates => {

            const index = emailTemplates.findIndex(emailTemplate => emailTemplate.name === name);

            if (index >= 0) {
              return emailTemplates[index];
            } else {
              return undefined;
            }

          })
        );

  }

  addEmailTemplate(FS, emailTemplate: EmailTemplate) {

    const path = `${FS.EmailTemplates}`;

    const docName = this.firestoreUtilsService.docName();

    emailTemplate.FSKey = docName;

    this.firestoreUtilsService.addToCollection(this.afs, path, docName, emailTemplate);

  }

  updateEmailTemplate(FS, emailTemplate: EmailTemplate) {

    const path = `${FS.EmailTemplates}`;

    this.firestoreUtilsService.update(this.afs, path, emailTemplate.FSKey, emailTemplate);

  }

  deleteEmailTemplate(FS, emailTemplateFSKey: string) {

    const path = `${FS.EmailTemplates}/${emailTemplateFSKey}`;

    this.firestoreUtilsService.delete(this.afs, path);

  }

}

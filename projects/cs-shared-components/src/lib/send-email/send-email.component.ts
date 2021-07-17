import { Component, EventEmitter, Input, OnInit, Output }                                       from '@angular/core';
import { EmailService }                                                                         from '../model/services/email.service';
import { AngularFirestore }                                                                     from '@angular/fire/firestore';
import { FirestoreUtilsService }                                                                from 'shared-components';
import {EnrolmentRequest} from '../model/classes/enrolment-request';

@Component({
  selector: 'cs-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: []
})
export class SendEmailComponent {

  recipientName             = '';
  recipientEmailAddress     = '';
  @Input()
  includeName               = false;
  @Input()
  subject:                  string;
  @Input()
  body:                     string;
  @Input()
  enrolmentPath:            string;
  @Input()
  enrolmentKey:             string;
  @Input()
  enrolmentRequest:         EnrolmentRequest;
  @Output()
  emailSent                 = new EventEmitter<boolean>();

  errorMessages:            string[] = [];

  constructor(private afs:                          AngularFirestore,
              private firestoreUtilsService:        FirestoreUtilsService,
              private emailService:                 EmailService) { }


  updateName(event) {

    if (!!event) {

      this.recipientName = event.value;

    }

  }

  updateEmail(event) {

    if (!!event) {

      this.recipientEmailAddress = event.value;

    }

  }

  sendEmail() {

    this.errorMessages = [];

    if (!!this.recipientEmailAddress) {

      this.body = this.addURI(this.body, this.enrolmentKey);

      this.emailService.sendEmail(this.recipientEmailAddress, this.subject, this.body);

      this.addEnrolment();

      this.emailSent.emit(true);

    } else {

      this.errorMessages.push('Email Address cannot be blank');

    }

  }

  addEnrolment() {

    const path = this.enrolmentPath;

    const docName = this.enrolmentKey;

    this.enrolmentRequest.FSKey                   = docName;
    this.enrolmentRequest.recipientEmailAddress   = this.recipientEmailAddress;
    this.enrolmentRequest.recipientName           = this.recipientName;

    this.firestoreUtilsService.addToCollection(this.afs, path, docName, this.enrolmentRequest);

  }

  addURI(body: string, enrolmentKey: string): string {

    return `${body}<p>Click to enrol https://customer-admin.web.app/enrol/?enrolCode=${enrolmentKey}</p>`;

  }

  cancel() {

    this.emailSent.emit(false);

  }

}

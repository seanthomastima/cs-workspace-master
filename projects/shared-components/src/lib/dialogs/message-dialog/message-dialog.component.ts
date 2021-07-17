import { Component, Inject, OnInit }                                                          from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }                                                      from '@angular/material/dialog';


@Component({
  selector: 'lib-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: []
})
export class MessageDialogComponent implements OnInit {

  message: string;

  constructor(private messageDialog: MatDialogRef<MessageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.message = this.data['message'];

  }

  close() {

    this.messageDialog.close();

  }

}

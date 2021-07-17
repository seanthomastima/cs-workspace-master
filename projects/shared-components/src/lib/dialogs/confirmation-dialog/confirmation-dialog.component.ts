import { Component, OnInit, Inject }                                                          from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }                                                      from '@angular/material/dialog';

@Component({
  selector: 'sc-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: []
})
export class ConfirmationDialogComponent implements OnInit {
  message: string;

  constructor(private confirmationDialog: MatDialogRef<ConfirmationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.message = this.data['message'];

  }

  close(selection: boolean) {

    this.confirmationDialog.close(selection);

  }

}

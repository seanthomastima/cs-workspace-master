import { Injectable }                                                                     from '@angular/core';
import { MessageDialogComponent }                                                         from "./message-dialog.component";
import { MatDialog, MatDialogRef }                                                        from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {

  messageDialog: MatDialogRef<MessageDialogComponent>;

  constructor(private dialog: MatDialog) { }

  public displayMessage(message: string): Promise<boolean> {

    this.messageDialog = this.dialog.open(MessageDialogComponent, {data: {message}});

    return new Promise((resolve) => {
      this.messageDialog
        .afterClosed()
        .subscribe(res => {
          resolve(res);
        });
    });

  }
}

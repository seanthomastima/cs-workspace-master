import { Injectable }                                                                                   from '@angular/core';
import { ConfirmationDialogComponent }                                                                  from './confirmation-dialog.component';
import { MatDialog, MatDialogRef }                                                                      from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  confirmationDialog: MatDialogRef<ConfirmationDialogComponent>;

  constructor(private dialog: MatDialog) { }

  public confirmSelection(message: string): Promise<boolean> {

    this.confirmationDialog = this.dialog.open(ConfirmationDialogComponent, {data: {message}});

    return new Promise((resolve) => {

      this.confirmationDialog
        .afterClosed()
        .subscribe(res => resolve(res));
    });

  }

}

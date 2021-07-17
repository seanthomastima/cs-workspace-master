import { Injectable }                                                                                 from '@angular/core';
import { MessageRecipientDetails, SelectRoleDialogComponent }                                         from './select-role-dialog.component';
import { MatDialog, MatDialogRef }                                                                    from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class SelectRoleDialogService {
  selectRoleDialogComponent:    MatDialogRef<SelectRoleDialogComponent>

  constructor(private dialog: MatDialog) { }

  public selectRole(includeTeams = true): Promise<MessageRecipientDetails> {

    this.selectRoleDialogComponent = this.dialog.open(SelectRoleDialogComponent, {data: {includeTeams}});

    return new Promise((resolve) => {

      this.selectRoleDialogComponent
        .afterClosed()
        .subscribe((recipientDetails: MessageRecipientDetails) => {
          resolve(recipientDetails);
        });

    });

  }

}

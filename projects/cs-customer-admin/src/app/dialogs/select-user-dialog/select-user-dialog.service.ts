import { Injectable }                                                                                 from '@angular/core';
import { SelectUserDialogComponent }                                                                  from './select-user-dialog.component';
import { MatDialog, MatDialogRef }                                                                    from '@angular/material/dialog';
import { User }                                                                                       from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class SelectUserDialogService {
  selectUserDialogComponent:    MatDialogRef<SelectUserDialogComponent>

  constructor(private dialog: MatDialog) { }

  public selectUser(): Promise<User> {

    this.selectUserDialogComponent = this.dialog.open(SelectUserDialogComponent);

    return new Promise((resolve) => {

      this.selectUserDialogComponent
        .afterClosed()
        .subscribe((user: User) => {
          resolve(user);
        });

    });
  }

}

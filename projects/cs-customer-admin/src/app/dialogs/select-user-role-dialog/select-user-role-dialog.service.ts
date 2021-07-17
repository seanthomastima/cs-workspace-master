import { Injectable }                                                           from '@angular/core';
import { SelectUserRoleDialogComponent }                                        from './select-user-role-dialog.component';
import { MatDialog, MatDialogRef }                                              from '@angular/material/dialog';
import { Role }                                                                 from 'cs-shared-components';

@Injectable({
  providedIn: 'root'
})
export class SelectUserRoleDialogService {
  selectUserRoleDialogComponent:    MatDialogRef<SelectUserRoleDialogComponent>

  constructor(private dialog: MatDialog) { }

  public selectRole(roles: Role[]): Promise<Role> {
    this.selectUserRoleDialogComponent = this.dialog.open(
      SelectUserRoleDialogComponent,
      {
        data: { roles }
      });

    return new Promise((resolve) => {
      this.selectUserRoleDialogComponent
        .afterClosed()
        .subscribe((role: Role) => {
          resolve(role);
        });
    });
  }

}

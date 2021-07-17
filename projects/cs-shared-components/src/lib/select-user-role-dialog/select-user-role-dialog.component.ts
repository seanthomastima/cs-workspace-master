import { Component, Inject, OnInit }                                                                    from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef }                                                                from '@angular/material/dialog';
import { Role }                                                                                         from '../model/classes/role';

@Component({
  selector: 'cs-select-user-role',
  templateUrl: './select-user-role-dialog.component.html',
  styleUrls: []
})
export class SelectUserRoleDialogComponent implements OnInit {
  roles:              Role[];
  selectedRole:       Role;

  constructor(private selectUserRoleDialogComponent:    MatDialogRef<SelectUserRoleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.roles = this.data['roles'];

  }

  select(role: Role) {
    this.selectedRole = role;
  }

  close() {

    this.selectUserRoleDialogComponent.close(this.selectedRole);

  }

  cancel() {

    this.selectUserRoleDialogComponent.close(null);

  }

}

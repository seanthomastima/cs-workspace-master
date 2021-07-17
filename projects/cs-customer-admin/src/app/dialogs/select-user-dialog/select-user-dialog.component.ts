import { Component, OnDestroy, OnInit }                                                                   from '@angular/core';
import { Subject }                                                                                        from 'rxjs';
import { CustomerService }                                                                                from '../../model/services/customer.service';
import { AuthService }                                                                                    from '../../model/services/auth.service';
import { UserService }                                                                                    from '../../model/services/user.service';
import { MatDialogRef }                                                                                   from '@angular/material/dialog';
import { LocalDataService }                                                                               from '../../model/services/local-data.service';
import { SignInContext }                                                                                  from '../../model/security/sign-in-context';
import { User }                                                                                           from 'cs-shared-components';

@Component({
  selector: 'select-user-dialog',
  templateUrl: './select-user-dialog.component.html',
  styleUrls: []
})
export class SelectUserDialogComponent implements OnInit, OnDestroy {
  user:                             User;
  users:                            User[];
  filteredUsers:                    User[];
  filter:                           string;
  signInContext:                    SignInContext;
  destroy$                          = new Subject();

  constructor(private selectUserDialogComponent:  MatDialogRef<SelectUserDialogComponent>,
              private customerService:            CustomerService,
              private userService:                UserService,
              private localDataService:           LocalDataService,
              private authService:                AuthService) { }

  ngOnInit() {

    this.authService.signInContext$
      .subscribe(signInContext => this.signInContext = signInContext);

    this.localDataService.users$
      .subscribe(users => {

        this.filteredUsers = users;

        this.users = users;

      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }


  select() {

    this.selectUserDialogComponent.close(this.user);

  }

  cancel() {

    this.selectUserDialogComponent.close(null);

  }

  onClick(user: User) {

    this.user = user;

  }

  filterList() {

    this.filteredUsers = this.users.filter(
      user => {
        return user.name.toLowerCase().includes(this.filter.toLowerCase());
      });

  }

}

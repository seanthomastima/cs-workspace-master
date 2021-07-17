import { Component, OnInit }                                                                          from '@angular/core';
import { LocalDataService }                                                                           from './model/services/local-data.service';
import { WindowSizeService }                                                                          from './model/services/window-size.service';
import { AngularFireAuth }                                                                            from '@angular/fire/auth';
import {filter, first, switchMap, tap} from 'rxjs/operators';
import { combineLatest, of }                                                                          from 'rxjs';
import { CustomerService }                                                                            from './model/services/customer.service';
import { AuthService }                                                                                from './model/services/auth.service';
import { Administrator }                                                                              from 'cs-shared-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit{
  title = 'CS-CustomerAdmin';

  constructor(private afAuth:                 AngularFireAuth,
              private authService:            AuthService,
              private customerService:        CustomerService,
              private localDataService:       LocalDataService,
              private windowSizeService:      WindowSizeService) {
  }

  ngOnInit() {

    this.localDataService.init();

    this.windowSizeService.init();

    // Initialise WindowSizeService
    this.windowSizeService.setWindowSize(
      window.innerWidth,
      window.innerHeight,
      true
    );

    this.updateSignInContextOnStartUp();

  }

  onResize(event) {

    this.windowSizeService.setWindowSize(
      event.target.innerWidth,
      event.target.innerHeight,
      true
    );

  }

  updateSignInContextOnStartUp() {

    interface AuthUser {
      uid:          string;
      displayName:  string;
      email:        string;
    }

    this.afAuth.user
      .pipe(
        filter(authUser => !!authUser),
        switchMap((authUser: AuthUser) => combineLatest([
          of(authUser),
          this.customerService.getCustomerFromUserFSKey(authUser.uid)
        ])),
        first()
      )
      .subscribe(([authUser, customer]) => {

        if (!!authUser && !customer) {

          // authUser is possibly only here from a previous unrelated Sign In, as an Administrator for example so Sign Out
          this.authService.signOut();

        }

        if (!!authUser && !!customer) {

          const administrator = new Administrator();

          administrator.FSKey                = authUser.uid;
          administrator.name                 = authUser.displayName;
          administrator.emailAddress         = authUser.email;
          administrator.customerFSKey        = customer.FSKey;

          this.authService.pushSignInContext(customer, administrator, this.localDataService);

        } else {

          this.authService.pushSignInContext(undefined, undefined, this.localDataService);

        }

      });

  }

}

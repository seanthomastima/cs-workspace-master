import { BrowserModule }                                                                                      from '@angular/platform-browser';
import { NgModule }                                                                                           from '@angular/core';
import { AppRoutingModule }                                                                                   from './app-routing.module';
import { AppComponent }                                                                                       from './app.component';
import { FormsModule, ReactiveFormsModule }                                                                   from '@angular/forms';
import { BrowserAnimationsModule }                                                                            from '@angular/platform-browser/animations';
import { MatSnackBarModule }                                                                                  from '@angular/material/snack-bar';
import { MatDialogModule }                                                                                    from '@angular/material/dialog';
import { MatProgressSpinnerModule }                                                                           from '@angular/material/progress-spinner';
import { AngularFireAuthModule }                                                                              from '@angular/fire/auth';
import { AngularFirestoreModule }                                                                             from '@angular/fire/firestore';
import { AngularFireFunctionsModule }                                                                         from '@angular/fire/functions';
import { AngularFireModule }                                                                                  from '@angular/fire';
import { ScrollingModule }                                                                                    from '@angular/cdk/scrolling';
import { MainMenuComponent }                                                                                  from './main-menu/main-menu.component';
import { LocalDataService }                                                                                   from './model/services/local-data.service';
import { AuthService }                                                                                        from './model/services/auth.service';
import { CustomerService }                                                                                    from './model/services/customer.service';
import { WindowSizeService }                                                                                  from './model/services/window-size.service';
import { CustomerDetailsComponent }                                                                           from './customer-details/customer-details.component';
import { AddUserComponent }                                                                                   from './add-user/add-user.component';
import { ProfileComponent }                                                                                   from './profile/profile.component';
import { MainComponent }                                                                                      from './main/main.component';
import { AdministratorsComponent }                                                                            from './administrators/administrators.component';
import { ManageProfileComponent }                                                                             from './manage-profile/manage-profile.component';
import { SignInComponent }                                                                                    from './sign-in/sign-in.component';
import { CustomerAdministratorService }                                                                       from './model/services/customer-administrator.service';
import { UpdatePasswordComponent }                                                                            from './update-password/update-password.component';
import { ManageUsersComponent }                                                                               from './manage-users/manage-users.component';
import { AuthGuard }                                                                                          from './model/security/auth.guard';
import { ManageRolesComponent }                                                                               from './manage-roles/manage-roles.component';
import { SelectRoleDialogService }                                                                            from './dialogs/select-role-dialog/select-role-dialog.service';
import { SelectUserDialogService }                                                                            from './dialogs/select-user-dialog/select-user-dialog.service';
import { SelectUserRoleDialogComponent }                                                                      from './dialogs/select-user-role-dialog/select-user-role-dialog.component';
import { SelectUserRoleDialogService }                                                                        from './dialogs/select-user-role-dialog/select-user-role-dialog.service';
import { SelectRoleDialogComponent }                                                                          from './dialogs/select-role-dialog/select-role-dialog.component';
import { SelectUserDialogComponent }                                                                          from './dialogs/select-user-dialog/select-user-dialog.component';
import { TeamService }                                                                                        from './model/services/team.service';
import { ManageTeamsComponent }                                                                               from './manage-teams/manage-teams.component';
import { SelectTeamDialogComponent }                                                                          from './dialogs/select-team-dialog/select-team-dialog.component';
import { SelectTeamDialogService }                                                                            from './dialogs/select-team-dialog/select-team-dialog.service';
import { SelectRolesComponent }                                                                               from './shared/select-roles/select-roles.component';
import { FontAwesomeModule }                                                                                  from '@fortawesome/angular-fontawesome';
import { FormUtilitiesModule,  }                                                                              from 'form-utilities';
import { SharedComponentsModule }                                                                             from 'shared-components';
import { ManageEnrolmentsComponent }                                                                                from './manage-enrolments/manage-enrolments.component';
import { EnrolComponent }                                                                                     from './enrol/enrol.component';
import { firebaseConfig }                                                                                     from '../environments/firebase.config';
import {CsSharedComponentsModule} from 'cs-shared-components';


@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    CustomerDetailsComponent,
    AddUserComponent,
    ProfileComponent,
    MainComponent,
    AdministratorsComponent,
    ManageProfileComponent,
    SignInComponent,
    UpdatePasswordComponent,
    ManageUsersComponent,
    ManageRolesComponent,
    SelectUserRoleDialogComponent,
    SelectRoleDialogComponent,
    SelectUserDialogComponent,
    ManageTeamsComponent,
    SelectTeamDialogComponent,
    SelectRolesComponent,
    ManageEnrolmentsComponent,
    EnrolComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireFunctionsModule,
        BrowserAnimationsModule,
        ScrollingModule,
        FontAwesomeModule,
        SharedComponentsModule,
        FormUtilitiesModule,
        CsSharedComponentsModule
    ],
  providers: [
    AuthGuard,
    LocalDataService,
    AuthService,
    CustomerService,
    WindowSizeService,
    CustomerAdministratorService,
    SelectRoleDialogService,
    SelectUserDialogService,
    SelectUserRoleDialogService,
    SelectTeamDialogService,
    TeamService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

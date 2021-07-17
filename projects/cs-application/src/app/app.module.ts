import { BrowserModule }                                                                                from '@angular/platform-browser';
import { NgModule }                                                                                     from '@angular/core';
import { AppRoutingModule }                                                                             from './app-routing.module';
import { AppComponent }                                                                                 from './app.component';
import { SharedComponentsModule }                                                                       from 'shared-components';
import { MainMenuComponent }                                                                            from './main-menu/main-menu.component';
import { HomeComponent }                                                                                from './home/home.component';
import { ManageChecklistsComponent }                                                                    from './manage-checklists/manage-checklists.component';
import { ProfileComponent }                                                                             from './profile/profile.component';
import { SignInComponent }                                                                              from './sign-in/sign-in.component';
import { UpdatePasswordComponent }                                                                      from './update-password/update-password.component';
import { MatSnackBarModule }                                                                            from '@angular/material/snack-bar';
import { MatDialogModule }                                                                              from '@angular/material/dialog';
import { MatProgressSpinnerModule }                                                                     from '@angular/material/progress-spinner';
import { FontAwesomeModule }                                                                            from '@fortawesome/angular-fontawesome';
import { AngularFireModule }                                                                            from '@angular/fire';
import { AngularFireAuthModule }                                                                        from '@angular/fire/auth';
import { AngularFirestoreModule }                                                                       from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule }                                                             from '@angular/forms';
import { AngularFireFunctionsModule }                                                                   from '@angular/fire/functions';
import { AuthGuard }                                                                                    from './model/security/auth.guard';
import { CsSharedComponentsModule, firebaseConfig }                                                     from 'cs-shared-components';
import { BrowserAnimationsModule }                                                                      from '@angular/platform-browser/animations';
import { ScrollingModule }                                                                              from '@angular/cdk/scrolling';
import { FormUtilitiesModule }                                                                          from 'form-utilities';
import { SelectRolesComponent }                                                                         from './select-roles/select-roles.component';

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    MainMenuComponent,
    HomeComponent,
    ManageChecklistsComponent,
    ProfileComponent,
    SignInComponent,
    UpdatePasswordComponent,
    SelectRolesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedComponentsModule,
    CsSharedComponentsModule,
    FormUtilitiesModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ScrollingModule,
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

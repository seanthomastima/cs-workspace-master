import { BrowserModule }                                                                                from '@angular/platform-browser';
import { NgModule }                                                                                     from '@angular/core';
import { AppRoutingModule }                                                                             from './app-routing.module';
import { AppComponent }                                                                                 from './app.component';
import { AddCustomerComponent }                                                                         from './add-customer/add-customer.component';
import { AddUserComponent }                                                                             from './add-user/add-user.component';
import { AdministratorsComponent }                                                                      from './administrators/administrators.component';
import { CustomersComponent }                                                                           from './customers/customers.component';
import { MainComponent }                                                                                from './main/main.component';
import { MainMenuComponent }                                                                            from './main-menu/main-menu.component';
import { SignInComponent }                                                                              from './sign-in/sign-in.component';
import { FormsModule, ReactiveFormsModule }                                                             from '@angular/forms';
import { MatSnackBarModule }                                                                            from '@angular/material/snack-bar';
import { MatDialogModule }                                                                              from '@angular/material/dialog';
import { MatProgressSpinnerModule }                                                                     from '@angular/material/progress-spinner';
import { AngularFireModule }                                                                            from '@angular/fire';
import { CsSharedComponentsModule }                                                                     from 'cs-shared-components';
import { AngularFireAuthModule }                                                                        from '@angular/fire/auth';
import { AngularFirestoreModule }                                                                       from '@angular/fire/firestore';
import { AngularFireFunctionsModule }                                                                   from '@angular/fire/functions';
import { BrowserAnimationsModule }                                                                      from '@angular/platform-browser/animations';
import { ScrollingModule }                                                                              from '@angular/cdk/scrolling';
import { FontAwesomeModule }                                                                            from '@fortawesome/angular-fontawesome';
import { SharedComponentsModule }                                                                       from 'shared-components';
import { FormUtilitiesModule }                                                                          from 'form-utilities';
import { ProfileComponent }                                                                             from './profile/profile.component';
import { ServiceWorkerModule }                                                                          from '@angular/service-worker';
import { environment }                                                                                  from '../environments/environment';
import { EmailTemplatesComponent }                                                                      from './email-templates/email-templates.component';
import {firebaseConfig} from '../environments/firebase.config';

@NgModule({
  declarations: [
    AppComponent,
    AddCustomerComponent,
    AddUserComponent,
    AdministratorsComponent,
    CustomersComponent,
    MainComponent,
    MainMenuComponent,
    ProfileComponent,
    SignInComponent,
    ProfileComponent,
    EmailTemplatesComponent
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
        CsSharedComponentsModule,
        FormUtilitiesModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

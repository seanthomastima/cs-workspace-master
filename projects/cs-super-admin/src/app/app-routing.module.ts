import { NgModule }                                                                                   from '@angular/core';
import { Routes, RouterModule }                                                                       from '@angular/router';
import { AdministratorsComponent }                                                                    from './administrators/administrators.component';
import { CustomersComponent }                                                                         from './customers/customers.component';
import { AddUserComponent }                                                                           from './add-user/add-user.component';
import { SignInComponent }                                                                            from './sign-in/sign-in.component';
import { MainComponent }                                                                              from './main/main.component';
import { ProfileComponent }                                                                           from './profile/profile.component';
import { EmailTemplatesComponent }                                                                    from './email-templates/email-templates.component';


const routes: Routes = [
  {
    path: 'administrators',
    component: AdministratorsComponent
  },
  {
    path: 'customers',
    component: CustomersComponent
  },
  {
    path: 'add-user',
    component: AddUserComponent
  },
  {
    path: 'email-templates',
    component: EmailTemplatesComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'main'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

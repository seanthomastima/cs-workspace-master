import { NgModule }                                                                                         from '@angular/core';
import { Routes, RouterModule }                                                                             from '@angular/router';
import { AdministratorsComponent }                                                                          from './administrators/administrators.component';
import { AuthGuard }                                                                                        from './model/security/auth.guard';
import { CustomerDetailsComponent }                                                                         from './customer-details/customer-details.component';
import { ManageUsersComponent }                                                                             from './manage-users/manage-users.component';
import { AddUserComponent }                                                                                 from './add-user/add-user.component';
import { ProfileComponent }                                                                                 from './profile/profile.component';
import { SignInComponent }                                                                                  from './sign-in/sign-in.component';
import { MainComponent }                                                                                    from './main/main.component';
import { ManageRolesComponent }                                                                             from './manage-roles/manage-roles.component';
import { ManageTeamsComponent }                                                                             from './manage-teams/manage-teams.component';
import { ManageEnrolmentsComponent }                                                                              from './manage-enrolments/manage-enrolments.component';
import { EnrolComponent }                                                                                   from './enrol/enrol.component';


const routes: Routes = [
  {
    path: 'administrators',
    component: AdministratorsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'customer-details',
    component: CustomerDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-users',
    component: ManageUsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-roles',
    component: ManageRolesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-teams',
    component: ManageTeamsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-user',
    component: AddUserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'enrolments',
    component: ManageEnrolmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'enrol',
    component: EnrolComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
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

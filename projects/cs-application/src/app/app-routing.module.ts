import { NgModule }                                                                               from '@angular/core';
import { Routes, RouterModule }                                                                   from '@angular/router';
import { ManageChecklistsComponent }                                                              from './manage-checklists/manage-checklists.component';
import { AuthGuard }                                                                              from './model/security/auth.guard';
import { ProfileComponent }                                                                       from './profile/profile.component';
import { SignInComponent }                                                                        from './sign-in/sign-in.component';
import { HomeComponent }                                                                          from './home/home.component';


const routes: Routes = [
  {
    path: 'manage-checklists',
    component: ManageChecklistsComponent,
    canActivate: [AuthGuard]
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
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

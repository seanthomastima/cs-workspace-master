import { Injectable }                                                                                   from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot }                                     from '@angular/router';
import { AuthService }                                                                                  from '../services/auth.service';
import { SignInContext }                                                                                from './sign-in-context';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Promise<boolean> {

    return new Promise((resolve) => {

      this.authService.signInContext$
        .subscribe((signInContext: SignInContext) => { resolve(signInContext.signedIn) });

    });
  }
}

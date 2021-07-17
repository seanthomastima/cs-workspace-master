import { Injectable, OnDestroy }                                                                    from '@angular/core';
import { Observable, ReplaySubject, Subject }                                                       from 'rxjs';
import { filter, map, switchMap, takeUntil, tap }                                                   from 'rxjs/operators';
import { AuthService }                                                                              from './auth.service';
import { Checklist }                                                                                from '../classes/checklist';
import { ChecklistService }                                                                         from './checklist.service';
import { RoleService }                                                                              from './role.service';
import { Role, User }                                                                               from 'cs-shared-components';
import { UserService }                                                                              from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService implements OnDestroy {
  private checklistSubject                                = new ReplaySubject<Checklist[]>(1);
  private rolesSubject                                    = new ReplaySubject<Role[]>(1);
  private usersSubject                                    = new ReplaySubject<User[]>(1);
  private destroy$                                        = new Subject();

  checklists$:                                            Observable<Checklist[]>                   = this.checklistSubject.asObservable();
  roles$:                                                 Observable<Role[]>                        = this.rolesSubject.asObservable();
  users$:                                                 Observable<User[]>                        = this.usersSubject.asObservable();

  constructor(private checklistService:                 ChecklistService,
              private roleService:                      RoleService,
              private authService:                      AuthService,
              private userService:                      UserService) { }

  /**
   * init is called from app.component
   */
  init() {

    // Get Checklists
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.checklistService.getChecklistsFIRESTORE(signInContext.customer.FSKey))
      )
      .subscribe(
        checklists => this.checklistSubject.next(checklists),
        err => console.log({LocalDataService_getChecklistsFIRESTORE: err})
      );

    // Get Roles
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.roleService.getRolesFIRESTORE(signInContext.customer.FSKey)),
      )
      .subscribe(
        roles => this.rolesSubject.next(roles),
        err => console.log({LocalDataService_getRolesFIRESTORE: err})
      );

    // Get Users
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.userService.getUsersFIRESTORE(signInContext.customer.FSKey)),
        map(users => users.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        users => this.usersSubject.next(users),
        err => console.log({LocalDataService_getUsersFIRESTORE: err})
      );

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }
}

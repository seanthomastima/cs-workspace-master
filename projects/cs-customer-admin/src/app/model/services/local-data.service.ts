import { Injectable, OnDestroy }                                                                    from '@angular/core';
import { combineLatest, forkJoin, from, Observable, of, ReplaySubject, Subject }                    from 'rxjs';
import { filter, switchMap, takeUntil, map, tap, flatMap }                                          from 'rxjs/operators';
import { CustomerService }                                                                          from './customer.service';
import { CustomerAdministratorService }                                                             from './customer-administrator.service';
import { AuthService }                                                                              from './auth.service';
import { UserService }                                                                              from './user.service';
import { RoleService }                                                                              from './role.service';
import { TeamService }                                                                              from './team.service';
import {
  Administrator,
  EmailTemplate,
  EmailTemplateService,
  EnrolmentRequest,
  EnrolmentRequestsService,
  Role,
  Team,
  User
}                                                                                                     from 'cs-shared-components';
import { FS }                                                                                         from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService implements OnDestroy{
  private customerAdministratorsSubject                   = new ReplaySubject<Administrator[]>(1);
  private usersSubject                                    = new ReplaySubject<User[]>(1);
  private rolesSubject                                    = new ReplaySubject<Role[]>(1);
  private teamsSubject                                    = new ReplaySubject<Team[]>(1);
  private enrolmentRequestsSubject                        = new ReplaySubject<EnrolmentRequest[]>(1);
  private emailTemplatesSubject                           = new ReplaySubject<EmailTemplate[]>(1);
  private destroy$                                        = new Subject();

  customerAdministrators$:                                Observable<Administrator[]>               = this.customerAdministratorsSubject.asObservable();
  users$:                                                 Observable<User[]>                        = this.usersSubject.asObservable();
  roles$:                                                 Observable<Role[]>                        = this.rolesSubject.asObservable();
  teams$:                                                 Observable<Team[]>                        = this.teamsSubject.asObservable();
  enrolmentRequests$:                                     Observable<EnrolmentRequest[]>            = this.enrolmentRequestsSubject.asObservable();
  emailTemplate$:                                         Observable<EmailTemplate[]>               = this.emailTemplatesSubject.asObservable();

  constructor(private customerAdministratorsService:    CustomerAdministratorService,
              private customerService:                  CustomerService,
              private userService:                      UserService,
              private roleService:                      RoleService,
              private teamService:                      TeamService,
              private enrolmentRequestsService:         EnrolmentRequestsService,
              private emailTemplateService:             EmailTemplateService,
              private authService:                      AuthService) { }

  /**
   * init is called from app.component
   */
  init() {

    // Get CustomerAdministrators
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => combineLatest([
          of(signInContext),
          this.customerAdministratorsService.getCustomerAdministratorsFIRESTORE(signInContext.customer.FSKey)
        ])),
        flatMap(([signInContext, admins]) => {
          const resArray = [];
          admins.map(admin => resArray.push(this.userService.getUserFromFSKey(signInContext, admin.FSKey)));
          return forkJoin(resArray);
        }),
        map(admins => Administrator.fromJsonList(admins)),
        map(customerAdministrators => customerAdministrators.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        customerAdministrators => this.customerAdministratorsSubject.next(customerAdministrators),
        err => console.log({LocalDataService_customerAdministratorsService: err})
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

    // Get Roles
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.roleService.getRolesFIRESTORE(signInContext.customer.FSKey)),
        map(roles => roles.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        roles => this.rolesSubject.next(roles),
        err => console.log({LocalDataService_getRolesFIRESTORE: err})
      );

    // Get Teams
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.teamService.getTeamsFIRESTORE(signInContext.customer.FSKey)),
        map(teams => teams.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        teams => this.teamsSubject.next(teams),
        err => console.log({LocalDataService_getTeamsFIRESTORE: err})
      );

    // Get EnrolmentRequests
    this.authService.signInContext$
      .pipe(
        takeUntil(this.destroy$),
        filter(signInContext => !! signInContext.customer),
        switchMap(signInContext => this.enrolmentRequestsService.getEnrolmentsFIRESTORE(signInContext.customer.FSKey)),
        map(enrolmentRequests => enrolmentRequests.sort((a, b) => (a.createdTimeStamp < b.createdTimeStamp) ? 1 : -1))
      )
      .subscribe(
        enrolmentRequests => this.enrolmentRequestsSubject.next(enrolmentRequests),
        err => console.log({LocalDataService_getEnrolmentsFIRESTORE: err})
      );

    // Get EmailTemplates
    this.emailTemplateService.getEmailTemplatesFIRESTORE(FS)
      .pipe(
        takeUntil(this.destroy$),
        map(emailTemplates => emailTemplates.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        emailTemplates => this.emailTemplatesSubject.next(emailTemplates),
        err => console.log({LocalDataService_getEmailTemplatesFIRESTORE: err})
      );


  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }
}

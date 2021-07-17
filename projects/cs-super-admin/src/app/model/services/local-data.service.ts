import { Injectable, OnDestroy }                                                                    from '@angular/core';
import { Observable, ReplaySubject, Subject }                                                       from 'rxjs';
import { SuperAdministratorsService }                                                               from './super-administrators.service';
import { map, takeUntil, tap }                                                                      from 'rxjs/operators';
import { Customer }                                                                                 from '../classes/customer';
import { CustomersService }                                                                         from './customers.service';
import {Administrator, EmailTemplate, EmailTemplateService} from 'cs-shared-components';
import { FS }                                                                                       from '../../../../../shared-files/firestore-constants';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService implements OnDestroy{
  private superAdministratorsSubject                      = new ReplaySubject<Administrator[]>(1);
  private customersSubject                                = new ReplaySubject<Customer[]>(1);
  private emailTemplatesSubject                           = new ReplaySubject<EmailTemplate[]>(1);
  private destroy$                                        = new Subject();

  superAdministrators$:                                   Observable<Administrator[]>           = this.superAdministratorsSubject.asObservable();
  customers$:                                             Observable<Customer[]>                = this.customersSubject.asObservable();
  emailTemplate$:                                         Observable<EmailTemplate[]>           = this.emailTemplatesSubject.asObservable();

  constructor(private superAdministratorsService:       SuperAdministratorsService,
              private customerService:                  CustomersService,
              private emailTemplateService:             EmailTemplateService) { }

  /**
   * init is called from app.component
   */
  init() {

    // Get SuperAdministrators
    this.superAdministratorsService.getSuperAdministratorsFIRESTORE()
      .pipe(
        takeUntil(this.destroy$),
        map(superAdministrators => superAdministrators.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        superAdministrators => this.superAdministratorsSubject.next(superAdministrators),
        err => console.log({LocalDataService_getSuperAdministratorsFIRESTORE: err})
      );

    // Get Customers
    this.customerService.getCustomersFIRESTORE()
      .pipe(
        takeUntil(this.destroy$),
        map(customers => customers.sort((a, b) => (a.name > b.name) ? 1 : -1))
      )
      .subscribe(
        customers => this.customersSubject.next(customers),
        err => console.log({LocalDataService_getCustomersFIRESTORE: err})
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

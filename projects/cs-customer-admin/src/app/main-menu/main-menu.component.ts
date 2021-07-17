import { Component, OnDestroy, OnInit }                                                                     from '@angular/core';
import { faBars }                                                                                           from '@fortawesome/free-solid-svg-icons';
import { Subject }                                                                                          from 'rxjs';
import { takeUntil }                                                                                        from 'rxjs/operators';
import { AuthService }                                                                                      from '../model/services/auth.service';
import { Router }                                                                                           from '@angular/router';
import { WindowSizeService }                                                                                from '../model/services/window-size.service';
import { ConfirmationDialogService }                                                                        from 'shared-components';

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  faBars                              = faBars;
  displaySideBar                      = true;
  windowSize$                         = this.windowSizeService.windowSize$;
  signInContext$                      = this.authService.signInContext$;
  destroy$        = new Subject();

  constructor(private authService:                  AuthService,
              private router:                       Router,
              private confirmationDialogService:    ConfirmationDialogService,
              private windowSizeService:            WindowSizeService) { }

  ngOnInit() {

    this.windowSizeService.setSideMenuOpen(this.displaySideBar);

    this.windowSize$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(windowSize => {
        const widthString = `${windowSize.sideMenuWidth}px`;
        document.getElementById('mySidebar').style.width = widthString;
      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }

  toggleSideBar() {

    this.displaySideBar = !this.displaySideBar;

    this.windowSizeService.setSideMenuOpen(this.displaySideBar);

  }

  signOut() {

    this.confirmationDialogService.confirmSelection('Confirm sign out')
      .then(confirmed => {
          if (confirmed) {

            this.authService.signOut();

            this.router.navigate(['/sign-in']);

          }

        });

  }

}

import { ApplicationRef, Component, OnInit }                                                              from '@angular/core';
import { LocalDataService }                                                                               from './model/services/local-data.service';
import { ConfirmationDialogService, WindowSizeService }                                                   from 'shared-components';
import { SwUpdate }                                                                                       from '@angular/service-worker';
import { concat, interval }                                                                               from 'rxjs';
import { first }                                                                                          from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  checkForAppUpdatesIntervalMinutes:    2;

  constructor(private localDataService:             LocalDataService,
              private windowSizeService:            WindowSizeService,
              private confirmationDialogService:    ConfirmationDialogService,
              private appRef:                       ApplicationRef,
              private swUpdate:                     SwUpdate) {
  }

  ngOnInit() {

    this.localDataService.init();

    this.windowSizeService.init();

    // Initialise WindowSizeService
    this.windowSizeService.setWindowSize(
      window.innerWidth,
      window.innerHeight,
      true
    );

    if (this.swUpdate.isEnabled) {

      // Check for update on startup
      this.swUpdate.available
        .subscribe(() => {

          this.confirmationDialogService.confirmSelection('New web application available. Update now?')
            .then(res => {

              if (res) {

                window.location.reload();

              }

            });

        });

      // Check for update periodically
      const appIsStable$ = this.appRef.isStable
        .pipe(
          first(isStable => isStable === true)
        );

      const interval$ = interval( this.checkForAppUpdatesIntervalMinutes * 60 * 1000);

      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, interval$);

      everySixHoursOnceAppIsStable$.subscribe(() => this.swUpdate.checkForUpdate());

    }

  }

  onResize(event) {

    this.windowSizeService.setWindowSize(
      event.target.innerWidth,
      event.target.innerHeight,
      true
    );

  }

}

import { Injectable }                                                                 from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject }                  from 'rxjs';
import { map }                                                                        from 'rxjs/operators';

export interface WindowSize {
  width:            number;
  height:           number;
  sideMenuWidth:    number;
  isMobile:         boolean;
}

const SIDE_MENU_WIDTH = 250;

@Injectable({
  providedIn: 'root'
})
export class WindowSizeService {
  private windowSizeSubject             = new ReplaySubject<WindowSize>(1);
  windowSize$: Observable<WindowSize>   = this.windowSizeSubject.asObservable();
  private leftBuffer                    = 100;
  private isMobileWidth                 = 1000;
  private sizeChange$                   = new ReplaySubject<WindowSize>(1);
  private menuOpen$                     = new BehaviorSubject<boolean>(false);

  constructor() { }

  init() {

    combineLatest([
      this.sizeChange$,
      this.menuOpen$
    ])
      .pipe(
        map(([windowSize, menuOpen]) => {
          if (menuOpen) {
            const width   = windowSize.width - SIDE_MENU_WIDTH;
            const height  = windowSize.height;
            const isMobile    = width < this.isMobileWidth;
            const sideMenuWidth = SIDE_MENU_WIDTH;
            return {width, height, sideMenuWidth, isMobile};
          } else {
            const width   = windowSize.width - this.leftBuffer;
            const height  = windowSize.height;
            const isMobile    = width < this.isMobileWidth;
            const sideMenuWidth = 0;
            return {width, height, sideMenuWidth, isMobile};
          }
        })
      )
      .subscribe((size: WindowSize) => {
        this.windowSizeSubject.next(size);
      });

  }

  setWindowSize(width, height: number, isMobile) {

    const sideMenuWidth = SIDE_MENU_WIDTH;

    this.sizeChange$.next({width, height, sideMenuWidth, isMobile});

  }

  setSideMenuOpen(open: boolean) {

    this.menuOpen$.next(open);

  }
}

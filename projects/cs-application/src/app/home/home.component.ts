import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                                   from '@angular/core';
import { Subject }                                                                                              from 'rxjs';
import { takeUntil }                                                                                            from 'rxjs/operators';
import { WindowSizeService }                                                                                    from 'shared-components';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv: ElementRef;
  windowSize$                         = this.windowSizeService.windowSize$;
  destroy$        = new Subject();

  constructor(private windowSizeService:            WindowSizeService,) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

    this.windowSize$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(windowSize => {
        const widthString = `${windowSize.sideMenuWidth}px`;
        this.mainDiv.nativeElement.style.marginLeft = widthString;
      });

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

  }


}

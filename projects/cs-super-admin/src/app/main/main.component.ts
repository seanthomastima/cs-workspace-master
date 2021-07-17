import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                           from '@angular/core';
import { Subject }                                                                                      from 'rxjs';
import { ScFormControls, WindowSizeService }                                                            from 'shared-components';
import { takeUntil }                                                                                    from 'rxjs/operators';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: []
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('main') mainDiv:         ElementRef;
  destroy$                            = new Subject();
  formControls:                       Partial<ScFormControls>[] =[];
  windowSize$                         = this.windowSizeService.windowSize$;
  version                             = 'Version 3.2';

  constructor(private elementRef:                   ElementRef,
              private windowSizeService:            WindowSizeService,) { }

  ngOnInit() {

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.complete();

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

}

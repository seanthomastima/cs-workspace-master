import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild }                           from '@angular/core';
import { Subject }                                                                                      from 'rxjs';
import { takeUntil }                                                                                    from 'rxjs/operators';
import { WindowSizeService }                                                                            from '../model/services/window-size.service';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['../../css/layout.css', '../../css/controls.css']
})
export class MainComponent implements OnInit, OnDestroy, AfterViewInit {
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

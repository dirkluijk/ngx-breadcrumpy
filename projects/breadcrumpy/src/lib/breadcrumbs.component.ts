import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { BREADCRUMBS } from './breadcrumbs';
import { Breadcrumb } from './breadcrumb';

@Component({
  standalone: true,
  selector: 'bcy-breadcrumbs',
  template: `
    <span *ngFor="let b of breadcrumbs$ | async; last as last" class="breadcrumb" [class.loading]="b.loading"
          [class.current]="last">
      <ng-container *ngIf="!last">
        <a [routerLink]="b.urlSegments">{{ b.label }}</a> <span class="separator"> / </span>
      </ng-container>
      <ng-container *ngIf="last">
        <span>{{ b.label }}</span>
      </ng-container>
    </span>
  `,
  imports: [
    AsyncPipe,
    RouterLink,
    NgIf,
    NgForOf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {
  constructor(@Inject(BREADCRUMBS) public breadcrumbs$: Observable<Breadcrumb[]>) {}
}

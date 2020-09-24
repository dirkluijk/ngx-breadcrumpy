import { Injector, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, isObservable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Breadcrumb } from '../breadcrumb';
import { BreadcrumbData, isResolverType, isLiteral } from '../breadcrumb-data';

@Injectable({ providedIn: 'root' })
export class BreadcrumbNormalizer {
  constructor(private readonly injector: Injector, private readonly router: Router) {}

  public normalizeBreadcrumb(data: BreadcrumbData, urlSegments: any[], route: ActivatedRouteSnapshot): Observable<Breadcrumb> {
    if (isObservable(data)) {
      return data.pipe(
        switchMap((resolvedData) => this.normalizeBreadcrumb(resolvedData, urlSegments, route))
      );
    }

    if (isResolverType(data)) {
      const resolver = this.injector.get(data);
      const resolvedData = resolver.resolve(route);

      return this.normalizeBreadcrumb(resolvedData, urlSegments, route);
    }

    if (typeof data === 'function') {
      const resolvedData = data(route);

      return this.normalizeBreadcrumb(resolvedData, urlSegments, route);
    }

    const tree = this.router.createUrlTree(urlSegments, {
      queryParamsHandling: 'merge'
    });

    const url = this.router.serializeUrl(tree);

    if (isLiteral(data)) {
      return of({ ...data, url, urlSegments });
    }

    return of({ label: String(data), url, urlSegments });
  }
}

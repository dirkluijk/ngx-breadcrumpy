import { Injector, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable, isObservable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Breadcrumb } from '../breadcrumb';
import { BreadcrumbData, isResolverType, isBreadcrumb } from '../breadcrumb-data';

@Injectable({ providedIn: 'root' })
export class BreadcrumbNormalizer {
  constructor(private readonly injector: Injector) {}

  public normalizeBreadcrumb(data: BreadcrumbData, url: string, route: ActivatedRouteSnapshot): Observable<Breadcrumb> {
    if (isObservable(data)) {
      return data.pipe(
        switchMap((resolvedData) => this.normalizeBreadcrumb(resolvedData, url, route))
      );
    }

    if (isResolverType(data)) {
      const resolver = this.injector.get(data);
      const resolvedData = resolver.resolve(route);

      return this.normalizeBreadcrumb(resolvedData, url, route);
    }

    if (typeof data === 'function') {
      const resolvedData = data(route);

      return this.normalizeBreadcrumb(resolvedData, url, route);
    }

    if (isBreadcrumb(data)) {
      return of({ ...data, url });
    }

    return of({ label: String(data), url });
  }
}

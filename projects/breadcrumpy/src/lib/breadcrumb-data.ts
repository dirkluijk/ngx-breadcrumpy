import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Type } from '@angular/core';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbResolver } from './breadcrumb-resolver';

type BreadcrumbFunction<T> = (route: ActivatedRouteSnapshot) => T;

export type BreadcrumbData =
  string |
  Breadcrumb |
  Observable<string | Breadcrumb> |
  BreadcrumbFunction<
    string |
    Breadcrumb |
    Observable<string | Breadcrumb>
    > |
  Type<BreadcrumbResolver>;

export function isResolverType(data: BreadcrumbData): data is Type<BreadcrumbResolver> {
  return typeof data === 'function' && data.prototype && data.prototype.resolve;
}

export function isBreadcrumb(data: BreadcrumbData): data is Breadcrumb {
  return typeof data === 'object' && 'label' in data;
}

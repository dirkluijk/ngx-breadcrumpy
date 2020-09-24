import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Type } from '@angular/core';

import { BreadcrumbResolver } from './breadcrumb-resolver';
import { BreadcrumbLiteral } from './breadcrumb-literal';

type BreadcrumbFunction<T> = (route: ActivatedRouteSnapshot) => T;

export type BreadcrumbData =
  string |
  BreadcrumbLiteral |
  Observable<string | BreadcrumbLiteral> |
  BreadcrumbFunction<
    string |
    BreadcrumbLiteral |
    Observable<string | BreadcrumbLiteral>
    > |
  Type<BreadcrumbResolver>;

export function isResolverType(data: BreadcrumbData): data is Type<BreadcrumbResolver> {
  return typeof data === 'function' && data.prototype && data.prototype.resolve;
}

export function isLiteral(data: BreadcrumbData): data is BreadcrumbLiteral {
  return typeof data === 'object' && 'label' in data;
}

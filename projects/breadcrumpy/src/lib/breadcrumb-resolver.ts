import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbLiteral } from './breadcrumb-literal';

export interface BreadcrumbResolver {
  resolve(route: ActivatedRouteSnapshot): string | BreadcrumbLiteral | Observable<string | Breadcrumb>;
}

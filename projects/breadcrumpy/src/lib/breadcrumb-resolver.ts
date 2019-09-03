import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';

import { Breadcrumb } from './breadcrumb';

export interface BreadcrumbResolver {
  resolve(route: ActivatedRouteSnapshot): string | Breadcrumb | Observable<string | Breadcrumb>;
}

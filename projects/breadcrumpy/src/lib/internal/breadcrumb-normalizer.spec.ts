import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { createServiceFactory } from '@ngneat/spectator';
import { createSpyObject } from '@ngneat/spectator/jest';
import { completed, next, observable } from '@dirkluijk/observable-matchers';
import { Observable, of } from 'rxjs';

import { BreadcrumbResolver } from '../breadcrumb-resolver';
import { BreadcrumbData } from '../breadcrumb-data';

import { BreadcrumbNormalizer } from './breadcrumb-normalizer';

@Injectable({providedIn: 'root'})
class FooResolver implements BreadcrumbResolver {
  public resolve(): Observable<string> {
    return of('Foo');
  }
}

describe('BreadcrumbNormalizer', () => {
  const createService = createServiceFactory(BreadcrumbNormalizer);
  const route = createSpyObject(ActivatedRouteSnapshot);

  it('should normalize all data types', () => {
    const spectator = createService();

    const inputs: BreadcrumbData[] = [
      'Foo',
      {label: 'Foo'},
      of('Foo'),
      of({label: 'Foo'}),
      () => 'Foo',
      () => ({label: 'Foo'}),
      FooResolver
    ];

    inputs.forEach((input) => {
      expect(spectator.service.normalizeBreadcrumb(input, '/foo', route)).toEqual(observable(
        next({
          label: 'Foo',
          url: '/foo'
        }),
        completed()
      ));
    });
  });
});

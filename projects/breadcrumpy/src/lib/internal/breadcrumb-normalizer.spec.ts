import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { createServiceFactory, createSpyObject } from '@ngneat/spectator/jest';
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
  const createService = createServiceFactory({
    service: BreadcrumbNormalizer,
    mocks: [Router]
  });

  const route = createSpyObject(ActivatedRouteSnapshot);

  it('should normalize all data types', () => {
    const spectator = createService();

    spectator.inject(Router).serializeUrl.andReturn('/foo');

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
      expect(spectator.service.normalizeBreadcrumb(input, ['/', 'foo'], route)).toEqual(observable(
        next({
          label: 'Foo',
          url: '/foo',
          urlSegments: ['/', 'foo']
        }),
        completed()
      ));
    });
  });
});

import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Component } from '@angular/core';
import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import { BREADCRUMBS, Breadcrumbs } from './breadcrumbs';
import { Breadcrumb } from './breadcrumb';

// tslint:disable-next-line
@Component({ template: '' })
class DummyComponent {}

describe('Breadcrumbs', () => {
  const createService = createServiceFactory({
    service: Breadcrumbs,
    declarations: [DummyComponent],
    imports: [
      RouterTestingModule.withRoutes([
        {
          path: '',
          component: DummyComponent
        },
        {
          path: 'foo',
          component: DummyComponent,
          data: { breadcrumb: 'Foo'},
          children: [
            {
              path: 'bar',
              component: DummyComponent,
              data: { breadcrumb: 'Bar'}
            }
          ]
        },
        {
          path: 'lorem/:id',
          component: DummyComponent,
          data: {
            breadcrumb: (snapshot: ActivatedRouteSnapshot) => {
              return of('Lorem ' + snapshot.paramMap.get('id')).pipe(delay(500));
            }},
          children: [
            {
              path: 'ipsum',
              component: DummyComponent,
              data: {
                breadcrumb: of('Ipsum').pipe(delay(500))
              }
            }
          ]
        },
      ])
    ]
  });

  let spectator: SpectatorService<Breadcrumbs>;
  let breadcrumbs: Breadcrumb[];
  let subscription: Subscription;
  let router: Router;

  beforeEach(() => {
    spectator = createService();
    subscription = spectator.service.subscribe((b) => breadcrumbs = b);

    router = spectator.get(Router);
    router.initialNavigation();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should react to routing changes', async () => {
    expect(breadcrumbs).toEqual([]);

    await router.navigate(['/foo']);

    expect(breadcrumbs).toEqual([
      {
        label: 'Foo',
        url: '/foo'
      }
    ]);

    await router.navigate(['/']);

    expect(breadcrumbs).toEqual([]);
  });

  it('should support nested breadcrumb', async () => {
    await router.navigate(['/foo/bar']);

    expect(breadcrumbs).toEqual([
      {
        label: 'Foo',
        url: '/foo'
      },
      {
        label: 'Bar',
        url: '/foo/bar'
      }
    ]);
  });

  it('should support complex async breadcrumbs and cache them when navigating up', fakeAsync(() => {
    router.navigate(['/lorem/10']);
    flushMicrotasks();

    expect(breadcrumbs).toEqual([
      {
        label: '...',
        loading: true
      }
    ]);

    tick(500);

    expect(breadcrumbs).toEqual([
      {
        label: 'Lorem 10',
        url: '/lorem/10'
      }
    ]);

    router.navigate(['/lorem/10/ipsum']);
    flushMicrotasks();

    expect(breadcrumbs).toEqual([
      {
        label: 'Lorem 10',
        url: '/lorem/10'
      },
      {
        label: '...',
        loading: true
      }
    ]);

    tick(500);

    expect(breadcrumbs).toEqual([
      {
        label: 'Lorem 10',
        url: '/lorem/10'
      },
      {
        label: 'Ipsum',
        url: '/lorem/10/ipsum'
      }
    ]);

    router.navigate(['/lorem/10']);
    flushMicrotasks();

    expect(breadcrumbs).toEqual([
      {
        label: 'Lorem 10',
        url: '/lorem/10'
      }
    ]);

    router.navigate(['/']);
    flushMicrotasks();

    router.navigate(['/lorem/10']);
    flushMicrotasks();

    expect(breadcrumbs).toEqual([
      {
        label: '...',
        loading: true
      }
    ]);

    tick(500);

    expect(breadcrumbs).toEqual([
      {
        label: 'Lorem 10',
        url: '/lorem/10'
      }
    ]);
  }));

  it('should have a injection token as alias', () => {
    expect(spectator.get(BREADCRUMBS) as any).toBe(spectator.service);
  });
});

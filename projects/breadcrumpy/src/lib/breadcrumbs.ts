import { Injectable, InjectionToken, inject, Inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, of, concat, defer, ReplaySubject, share } from 'rxjs';
import { filter, startWith, map, switchMap, shareReplay, takeUntil } from 'rxjs/operators';
import { concatIfEmpty } from 'rxjs-etc/operators';

import { ProxyObservable } from './internal/proxy-observable';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbNormalizer } from './internal/breadcrumb-normalizer';
import { BreadcrumbData } from './breadcrumb-data';

interface BreadcrumbCacheEntry {
  breadcrumb$: Observable<Breadcrumb>;
  complete(): void;
}

export function defaultBreadcrumbKey(): string {
  return 'breadcrumb';
}

export const BREADCRUMB_KEY = new InjectionToken<string>('breadcrumpy.key', {
  providedIn: 'root',
  factory: defaultBreadcrumbKey
});

@Injectable({ providedIn: 'root' })
export class Breadcrumbs extends ProxyObservable<Breadcrumb[]> {
  /**
   * Cache to remember breadcrumbs when navigating up
   */
  private readonly cache = new Map<string, BreadcrumbCacheEntry>();

  constructor(
    router: Router,
    private readonly route: ActivatedRoute,
    private readonly normalizer: BreadcrumbNormalizer,
    @Inject(BREADCRUMB_KEY) private readonly breadcrumbKey: string
  ) {
    super(router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(true),
      map(() => this.route.root),
      switchMap((root) => this.buildBreadcrumbs(root)),
      share({
        connector: () => new ReplaySubject(1),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false
      })
    ));
  }

  private buildBreadcrumbs(
    route: ActivatedRoute | null,
    previousSegments: any[] = ['./'],
    previous: Breadcrumb[] = []
  ): Observable<Breadcrumb[]> {
    if (!route) {
      return of(previous);
    }

    const routeConfig = route.routeConfig;
    const configured = routeConfig ? this.breadcrumbKey in (routeConfig.data || routeConfig.resolve || {}) : false;

    const newUrlSegments = route.snapshot.url.flatMap((s) => s.parameterMap.keys.length ? [s.path, s.parameters] : [s.path]);
    const urlSegments = [...previousSegments, ...newUrlSegments];

    const cacheKey = urlSegments.slice(1).filter((it) => typeof it === 'string').join('/');

    if (!route.firstChild) {
      this.invalidateCache(cacheKey);
    }

    if (!configured) {
      return this.buildBreadcrumbs(route.firstChild, urlSegments, previous);
    }

    const data: BreadcrumbData = route.snapshot.data[this.breadcrumbKey];
    const completeSubject = new Subject<void>();

    const breadcrumb$ = this.cache.has(cacheKey) ?
      this.cache.get(cacheKey)!.breadcrumb$ :
      this.normalizer.normalizeBreadcrumb(data, urlSegments, route.snapshot).pipe(
        shareReplay({ refCount: false }),
        takeUntil(completeSubject)
      );

    this.cache.set(cacheKey, {
      breadcrumb$,
      complete: () => completeSubject.next()
    });

    return concat(
      of([...previous, { label: '...', loading: true }]),
      breadcrumb$.pipe(
        switchMap((b) => this.buildBreadcrumbs(route.firstChild, urlSegments, [...previous, b])),
        concatIfEmpty(defer(() => this.buildBreadcrumbs(route.firstChild, urlSegments, previous)))
      )
    );
  }

  private invalidateCache(cacheKey: string): void {
    this.cache.forEach((_, key) => {
      if (!cacheKey.startsWith(key)) {
        this.cache.get(key)!.complete();
        this.cache.delete(key);
      }
    });
  }
}

export const BREADCRUMBS = new InjectionToken<Breadcrumbs>('breadcrumpy.breadcrumbs', {
  providedIn: 'root',
  factory: () => inject(Breadcrumbs)
});

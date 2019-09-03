import { Injectable, InjectionToken, inject, Inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, of, concat } from 'rxjs';
import { filter, tap, startWith, map, switchMap, publishReplay, refCount, shareReplay, takeUntil } from 'rxjs/operators';
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
      tap((event) => this.invalidateCache(event.url)),
      startWith(true),
      map(() => this.route.root),
      switchMap((root) => this.buildBreadcrumbs(root)),
      publishReplay(),
      refCount(),
    ));
  }

  private buildBreadcrumbs(
    route: ActivatedRoute | null,
    previousUrl: string = '',
    previous: Breadcrumb[] = []
  ): Observable<Breadcrumb[]> {
    if (!route) {
      return of(previous);
    }

    const routeConfig = route.routeConfig;
    const configured = routeConfig ? this.breadcrumbKey in (routeConfig.data || routeConfig.resolve || {}) : false;

    const url = [previousUrl, ...route.snapshot.url.map((s) => s.path)].join('/');

    if (!configured) {
      return this.buildBreadcrumbs(route.firstChild, url, previous);
    }

    const data: BreadcrumbData = route.snapshot.data[this.breadcrumbKey];
    const completeSubject = new Subject<void>();

    const breadcrumb$ = this.cache.has(url) ?
      this.cache.get(url)!.breadcrumb$ :
      this.normalizer.normalizeBreadcrumb(data, url, route.snapshot).pipe(
        publishReplay(),
        refCount(),
        shareReplay({ refCount: false }),
        takeUntil(completeSubject)
      );

    this.cache.set(url, {
      breadcrumb$,
      complete: () => completeSubject.next()
    });

    return concat(
      of([...previous, { label: '...', loading: true }]),
      breadcrumb$.pipe(
        switchMap((b) => this.buildBreadcrumbs(route.firstChild, url, [...previous, b])),
        concatIfEmpty(this.buildBreadcrumbs(route.firstChild, url, previous))
      )
    );
  }

  private invalidateCache(url: string): void {
    this.cache.forEach((_, key) => {
      if (!url.startsWith(key)) {
        this.cache.get(key)!.complete();
        this.cache.delete(key);
      }
    });
  }
}

export const BREADCRUMBS = new InjectionToken<Observable<Breadcrumb[]>>('breadcrumpy.breadcrumbs', {
  providedIn: 'root',
  factory: () => inject(Breadcrumbs)
});

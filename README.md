# Breadcrumpy 🍞

> Awesome breadcrumbs for Angular!

[![NPM version](http://img.shields.io/npm/v/@dirkluijk/ngx-breadcrumpy.svg?style=flat-square)](https://www.npmjs.com/package/@dirkluijk/ngx-breadcrumpy)
[![NPM downloads](http://img.shields.io/npm/dm/@dirkluijk/ngx-breadcrumpy.svg?style=flat-square)](https://www.npmjs.com/package/@dirkluijk/ngx-breadcrumpy)
[![Build status](https://img.shields.io/travis/dirkluijk/ngx-breadcrumpy.svg?style=flat-square)](https://travis-ci.org/dirkluijk/ngx-breadcrumpy)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

## Overview

### What? 🤔

An awesome library to easily add breadcrumbs to your Angular application.

* Simply add breadcrumb labels to your Angular routing
* It supports asynchronous (reactive) breadcrumbs
* Flexible configuration. However you like to roll!
* ~~Angular Material and PrimeNG examples included~~ (on roadmap)

### Why? 🤷‍♂️

Existing breadcrumb libraries do not seem to support async (reactive) breadcrumbs.
Also, this library provides many different configuration options.  

## Installation 🌩

##### npm

```
npm install @dirkluijk/ngx-breadcrumpy
```

##### yarn

```
yarn add @dirkluijk/ngx-breadcrumpy
```

## Usage 🕹

### Basic example

Just add a `breadcrumb` data property to your routes.

```typescript
export const ROUTES: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    data: { breadcrumb: 'About' }
  },
  {
    path: 'products',
    data: { breadcrumb: 'Products' }
  }
];
```

#### a) Use the default breadcrumb component:
Now, import the `BreadcrumbsModule` and add the included breadcrumb component to your template:
```html
<bcy-breadcrumbs></bcy-breadcrumbs>
<router-outlet></router-outlet>
```

#### b) Or implement your own:
Alternatively, implement your own breadcrumb component using the `BREADCRUMBS` injection token:

```typescript
import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb, BREADCRUMBS } from '@dirkluijk/ngx-breadcrumpy';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <ng-container *ngFor="let b of breadcrumbs$ | async; last as last">
      <a [routerLink]="b.url">{{ b.label }}</a> <span *ngIf="!last"> / </span>
    </ng-container>
  `
})
export class BreadcrumbComponent {
  constructor(@Inject(BREADCRUMBS) public breadcrumbs$: Observable<Breadcrumb[]>) {}
}
```


### Advanced configuration

Instead of static breadcrumbs, you may want to make your breadcrumb labels more dynamic. There are several ways to do this!

The breadcrumb configuration can be of many types:

* `string` (label)
* `Breadcrumb` (object with `label` and optionally an `icon`)
* `Observable<string | Breadcrumb>`
* `(route: ActivatedRouteSnapshot) => string`
* `(route: ActivatedRouteSnapshot) => Breadcrumb`
* `(route: ActivatedRouteSnapshot) => Observable<string | Breadcrumb>`
* `Type<BreadcrumbResolver>`

Of course you can also make combinations. Please find some examples below.

#### 1. Using functions

A function which returns a `string`, `Breadcrumb` or `Observable<string | Breadcrumb>`.

```typescript
export const ROUTES: Routes = [
  {
    path: 'product/:id',
    data: {
      breadcrumb: (route: ActivatedRouteSnapshot) => `Product ${route.paramMap.get('id')}` 
    }
  }
];
```

#### 2. Using a BreadcrumbResolver

You can also use a special `BreadcrumbResolver` service to benefit from dependency injection.
The `resolve` method should return either a `string`, `Breadcrumb` or `Observable<string | Breadcrumb>`.

Asynchronous observables will not block the routing process, but make the breadcrumb appear when resolved. 

```typescript
export const ROUTES: Routes = [
  {
    path: 'product/:id',
    data: { breadcrumb: YourBreadcrumbResolver }
  }
];

@Injectable({ providedIn: 'root' })
class YourBreadcrumbResolver implements BreadcrumbResolver {
  public resolve(route: ActivatedRouteSnapshot): Observable<string> {
    // just some example of an async breadcrumb label...
    return of(`Product ${route.paramMap.get('id')}`).pipe(delay(300));
  }
}
```

#### 3. Using Resolve guards

If you want to stick with resolve guards from `@angular/router`, you can.
They will will dynamically add the `breadcrumb` property to your route.  

```typescript
export const ROUTES: Routes = [
  {
    path: 'product/:id',
    resolve: { breadcrumb: YourResolveGuard }
  }
];

@Injectable({ providedIn: 'root' })
class YourResolveGuard implements Resolve<string | Breadcrumb> {
  /* ... */
}
```

NOTE: keep in mind that the resolve guards from Angular Router are blocking! To get around this, use the
previously mentioned `BreadcrumbResolver`. You can also make your guard return
an `Observable<Observable<string | Breadcrumb>>`. Breadcrumpy will automatically support this.

### Using a different route property

Just provide a `BREADCRUMB_KEY` token in your root module to change the default `breadcrumb` property name.

```typescript
import { BREADCRUMB_KEY } from '@dirkluijk/ngx-breadcrumpy';

@NgModule({
  providers: [
    {
      provide: BREADCRUMB_KEY,
      useValue: 'yourBreadcrumb'
    }
  ]
})
class AppModule {}
```

### Using translations (i18n)

Just implement your [own breadcrumb component](#b-or-implement-your-own) and use translation pipes for your breadcrumb labels.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/dirkluijk"><img src="https://avatars2.githubusercontent.com/u/2102973?v=4" width="100px;" alt="Dirk Luijk"/><br /><sub><b>Dirk Luijk</b></sub></a><br /><a href="https://github.com/dirkluijk/@ngx-dirkluijk/ngx-breadcrumpy/commits?author=dirkluijk" title="Code">💻</a> <a href="https://github.com/dirkluijk/@dirkluijk/ngx-breadcrumpy/commits?author=dirkluijk" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

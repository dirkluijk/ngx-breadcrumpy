import { Observable, of } from 'rxjs';
import { createComponentFactory } from '@ngneat/spectator';
import { RouterTestingModule } from '@angular/router/testing';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { BREADCRUMBS } from './breadcrumbs';

describe('BreadcrumbsComponent', () => {
  const breadcrumbs$: Observable<Breadcrumb[]> = of([
    {
      label: 'Home',
      url: '/'
    },
    {
      label: 'Products',
      url: '/products'
    },
    {
      label: '...',
      loading: true,
      url: '/products/2'
    },
    {
      label: 'Reviews',
      url: '/products/2/reviews'
    }
  ]);

  const createComponent = createComponentFactory({
    component: BreadcrumbsComponent,
    imports: [RouterTestingModule],
    providers: [
      {
        provide: BREADCRUMBS,
        useValue: breadcrumbs$
      }
    ]
  });

  it('should show all breadcrumbs', () => {
    const spectator = createComponent();

    expect(spectator.queryAll('.breadcrumb')).toHaveLength(4);

    const [bc1, bc2, bc3, bc4] = spectator.queryAll('.breadcrumb');

    expect(bc1).toHaveText('Home');
    expect(bc2).toHaveText('Products');
    expect(bc3).toHaveText('...');
    expect(bc4).toHaveText('Reviews');
  });

  it('should use hyperlinks except for current', () => {
    const spectator = createComponent();

    const [bc1, bc2, bc3, bc4] = spectator.queryAll('.breadcrumb');

    expect(bc1).toHaveDescendant('a');
    expect(bc2).toHaveDescendant('a');
    expect(bc3).toHaveDescendant('a');
    expect(bc4).not.toHaveDescendant('a');
  });

  it('should visualize loading', () => {
    const spectator = createComponent();

    const [bc1, bc2, bc3, bc4] = spectator.queryAll('.breadcrumb');

    expect(bc1).not.toHaveClass('loading');
    expect(bc2).not.toHaveClass('loading');
    expect(bc3).toHaveClass('loading');
    expect(bc4).not.toHaveClass('loading');
  });
});

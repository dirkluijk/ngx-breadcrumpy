import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Breadcrumb, BREADCRUMBS } from 'ngx-breadcrumpy';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(@Inject(BREADCRUMBS) public breadcrumbs$: Observable<Breadcrumb[]>) {}
}

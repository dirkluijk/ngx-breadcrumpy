import { Observable } from 'rxjs';

export abstract class ProxyObservable<T> extends Observable<T> {
  constructor(source$: Observable<T>) {
    super((observer) => {
      return source$.subscribe(observer);
    });
  }
}

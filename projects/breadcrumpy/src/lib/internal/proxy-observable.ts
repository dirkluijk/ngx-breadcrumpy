import { Observable } from 'rxjs';

export abstract class ProxyObservable<T> extends Observable<T> {
  constructor(source$: Observable<T>) {
    super((observer) => {
      const subscription = source$.subscribe(
        (value) => observer.next(value),
        (error) => observer.error(error),
        () => observer.complete()
      );

      return () => subscription.unsubscribe();
    });
  }
}

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && request.url !== '/api/auth/me') {
        const returnTo = window.location.pathname + window.location.search;
        window.location.assign(`/login?expired=1&returnTo=${encodeURIComponent(returnTo)}`);
      }
      return throwError(() => error);
    }),
  );

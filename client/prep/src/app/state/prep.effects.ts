import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, mergeMap } from 'rxjs';
import { PrepApi } from '../core/prep-api';
import { PrepActions } from './prep.actions';

@Injectable()
export class PrepEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(PrepApi);

  loadInterviews$ = createEffect(() => this.actions$.pipe(
    ofType(PrepActions.loadInterviews),
    switchMap(() => this.api.interviews().pipe(
      map(({ applications }) => PrepActions.interviewsLoaded({ interviews: applications })),
      catchError(() => of(PrepActions.interviewsFailed())),
    )),
  ));

  loadPlan$ = createEffect(() => this.actions$.pipe(
    ofType(PrepActions.loadPlan),
    mergeMap(({ applicationId }) => this.api.detail(applicationId).pipe(
      map(({ prep, application }) => PrepActions.planLoaded({ applicationId, application, prep: { ...prep, sessions: prep.sessions ?? [] } })),
      catchError(() => of(PrepActions.planFailed({ applicationId }))),
    )),
  ));

  savePlan$ = createEffect(() => this.actions$.pipe(
    ofType(PrepActions.savePlan),
    mergeMap(({ applicationId, prep }) => this.api.save(applicationId, prep).pipe(
      map(() => PrepActions.planSaved({ applicationId, prep })),
      catchError(() => of(PrepActions.saveFailed({ applicationId }))),
    )),
  ));

  recordSession$ = createEffect(() => this.actions$.pipe(
    ofType(PrepActions.recordSession),
    mergeMap(({ applicationId, results }) => this.api.recordSession(applicationId, results).pipe(
      map(({ session }) => PrepActions.sessionRecorded({ applicationId, session })),
      catchError(() => of(PrepActions.sessionFailed({ applicationId }))),
    )),
  ));
}

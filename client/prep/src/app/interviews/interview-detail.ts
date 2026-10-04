import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { checklist, questions } from './questions';
import { PrepActions } from '../state/prep.actions';
import { selectApplication, selectDirty, selectError, selectLoading, selectPlan, selectSaving } from '../state/prep.selectors';

@Component({
  selector: 'app-interview-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './interview-detail.html',
})
export class InterviewDetail implements OnInit {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly checklist = checklist;
  readonly questions = questions;
  readonly application = this.store.selectSignal(selectApplication(this.applicationId));
  readonly plan = this.store.selectSignal(selectPlan(this.applicationId));
  readonly loading = this.store.selectSignal(selectLoading(this.applicationId));
  readonly saving = this.store.selectSignal(selectSaving(this.applicationId));
  readonly error = this.store.selectSignal(selectError(this.applicationId));
  readonly dirty = this.store.selectSignal(selectDirty(this.applicationId));
  readonly toast = signal('');
  readonly completedTasks = computed(() => this.plan()?.completedTasks ?? []);
  readonly notes = computed(() => this.plan()?.notes ?? '');
  readonly progress = computed(() => this.completedTasks().length +
    (this.plan()?.practice.filter(item => item.practiced).length ?? 0));

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => clearTimeout(this.toastTimer));
    this.actions$.pipe(
      ofType(PrepActions.planSaved),
      filter(action => action.applicationId === this.applicationId),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.toast.set('Preparation saved successfully');
      this.toastTimer = setTimeout(() => this.toast.set(''), 5000);
    });
    if (!this.plan()) this.load();
  }

  load(): void {
    this.store.dispatch(PrepActions.loadPlan({ applicationId: this.applicationId }));
  }

  toggleTask(taskId: string): void {
    this.store.dispatch(PrepActions.toggleTask({ applicationId: this.applicationId, taskId }));
  }

  setNotes(event: Event): void {
    this.store.dispatch(PrepActions.setNotes({ applicationId: this.applicationId,
      notes: (event.target as HTMLTextAreaElement).value }));
  }

  save(): void {
    const plan = this.plan();
    if (!plan || !this.dirty() || this.saving()) return;
    this.dismissToast();
    this.store.dispatch(PrepActions.savePlan({ applicationId: this.applicationId,
      prep: { completedTasks: plan.completedTasks, practice: plan.practice, notes: plan.notes } }));
  }

  dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast.set('');
  }
}

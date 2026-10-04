import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { signal } from '@angular/core';

import { questions } from './questions';
import { PrepActions } from '../state/prep.actions';
import { selectApplication, selectDirty, selectError, selectLoading, selectPlan, selectSaving } from '../state/prep.selectors';

@Component({
  selector: 'app-question-bank',
  imports: [RouterLink],
  templateUrl: './question-bank.html',
})
export class QuestionBank implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  readonly applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';
  readonly questions = questions;
  readonly categories = ['All', 'Your story', 'Frontend', 'Engineering'] as const;
  readonly category = signal<string>('All');
  readonly filtered = computed(() => this.category() === 'All' ? questions :
    questions.filter(question => question.category === this.category()));
  readonly application = this.store.selectSignal(selectApplication(this.applicationId));
  readonly plan = this.store.selectSignal(selectPlan(this.applicationId));
  readonly loading = this.store.selectSignal(selectLoading(this.applicationId));
  readonly saving = this.store.selectSignal(selectSaving(this.applicationId));
  readonly dirty = this.store.selectSignal(selectDirty(this.applicationId));
  readonly error = this.store.selectSignal(selectError(this.applicationId));
  readonly practicedCount = computed(() => this.plan()?.practice.filter(item => item.practiced).length ?? 0);

  ngOnInit(): void {
    if (!this.plan()) this.store.dispatch(PrepActions.loadPlan({ applicationId: this.applicationId }));
  }

  answerFor(id: string): string {
    return this.plan()?.practice.find(item => item.questionId === id)?.answer ?? '';
  }

  practiced(id: string): boolean {
    return this.plan()?.practice.find(item => item.questionId === id)?.practiced ?? false;
  }

  setAnswer(id: string, event: Event): void {
    this.store.dispatch(PrepActions.setAnswer({ applicationId: this.applicationId,
      questionId: id, answer: (event.target as HTMLTextAreaElement).value }));
  }

  togglePracticed(id: string): void {
    this.store.dispatch(PrepActions.togglePracticed({ applicationId: this.applicationId, questionId: id }));
  }

  save(): void {
    const plan = this.plan();
    if (!plan || !this.dirty() || this.saving()) return;
    this.store.dispatch(PrepActions.savePlan({ applicationId: this.applicationId,
      prep: { completedTasks: plan.completedTasks, practice: plan.practice, notes: plan.notes } }));
  }
}

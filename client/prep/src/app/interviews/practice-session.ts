import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { PracticeSession } from '../core/prep-api';
import { questions } from './questions';
import { PrepActions } from '../state/prep.actions';
import { selectApplication, selectDirty, selectError, selectLoading, selectPlan, selectRecording } from '../state/prep.selectors';

const sessionIds = ['introduction', 'challenge', 'accessibility', 'testing', 'architecture'];

@Component({
  selector: 'app-practice-session',
  imports: [DatePipe, RouterLink],
  templateUrl: './practice-session.html',
})
export class PracticeSessionPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';
  readonly questions = questions.filter(question => sessionIds.includes(question.id));
  readonly application = this.store.selectSignal(selectApplication(this.applicationId));
  readonly plan = this.store.selectSignal(selectPlan(this.applicationId));
  readonly loading = this.store.selectSignal(selectLoading(this.applicationId));
  readonly recording = this.store.selectSignal(selectRecording(this.applicationId));
  readonly unsavedAnswers = this.store.selectSignal(selectDirty(this.applicationId));
  readonly error = this.store.selectSignal(selectError(this.applicationId));
  readonly index = signal(0);
  readonly seconds = signal(0);
  readonly ratings = signal<PracticeSession['results']>([]);
  readonly submitted = signal(false);
  private initialSessionCount = 0;
  readonly saved = computed(() => this.submitted() &&
    (this.plan()?.sessions.length ?? 0) > this.initialSessionCount);
  readonly current = computed(() => this.questions[this.index()]);
  readonly rating = computed(() => this.ratings().find(item => item.questionId === this.current().id)?.confidence);
  readonly time = computed(() => `${Math.floor(this.seconds() / 60)}:${String(this.seconds() % 60).padStart(2, '0')}`);
  readonly confident = computed(() => this.ratings().filter(item => item.confidence === 3).length);
  readonly recentSessions = computed(() => [...(this.plan()?.sessions ?? [])].slice(-3).reverse());

  ngOnInit(): void {
    if (!this.plan()) this.retryLoad();
    this.initialSessionCount = this.plan()?.sessions.length ?? 0;
    const interval = setInterval(() => { if (!this.saved()) this.seconds.update(value => value + 1); }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  retryLoad(): void {
    this.store.dispatch(PrepActions.loadPlan({ applicationId: this.applicationId }));
  }

  countConfident(session: PracticeSession): number {
    return session.results.filter(result => result.confidence === 3).length;
  }

  rate(confidence: 1 | 2 | 3): void {
    const questionId = this.current().id;
    this.ratings.update(items => [...items.filter(item => item.questionId !== questionId), { questionId, confidence }]);
  }

  next(): void {
    if (!this.rating()) return;
    if (this.index() < this.questions.length - 1) {
      this.index.update(index => index + 1);
      return;
    }
    if (this.recording()) return;
    this.submitted.set(true);
    this.initialSessionCount = this.plan()?.sessions.length ?? 0;
    this.store.dispatch(PrepActions.recordSession({ applicationId: this.applicationId,
      results: this.questions.map(question => this.ratings().find(item => item.questionId === question.id)!),
    }));
  }
}

import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { questions } from './questions';
import { PrepActions } from '../state/prep.actions';
import { selectInterviews, selectListError, selectListLoading } from '../state/prep.selectors';

@Component({
  selector: 'app-interview-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './interview-list.html',
})
export class InterviewList implements OnInit {
  private readonly store = inject(Store);
  readonly interviews = this.store.selectSignal(selectInterviews);
  readonly loading = this.store.selectSignal(selectListLoading);
  readonly error = this.store.selectSignal(selectListError);
  readonly questionCount = questions.length;
  readonly practicedQuestions = computed(() => this.interviews().reduce(
    (total, interview) => total + (interview.progress?.practicedQuestions ?? 0), 0));
  readonly sessions = computed(() => this.interviews().reduce(
    (total, interview) => total + (interview.progress?.sessions ?? 0), 0));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.store.dispatch(PrepActions.loadInterviews());
  }
}

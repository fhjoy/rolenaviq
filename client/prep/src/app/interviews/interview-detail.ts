import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { InterviewApplication, PracticeAnswer, PrepApi } from '../core/prep-api';

export const checklist = [
  { id: 'company-research', label: 'Research the company and its product' },
  { id: 'role-research', label: 'Review the role and its requirements' },
  { id: 'examples', label: 'Prepare examples from your experience' },
  { id: 'questions', label: 'Write questions to ask the interviewer' },
];

export const questions = [
  { id: 'introduction', prompt: 'Tell me about yourself.' },
  { id: 'interest', prompt: 'Why are you interested in this role?' },
  { id: 'challenge', prompt: 'Tell me about a challenge you solved.' },
  { id: 'teamwork', prompt: 'How do you work with a team?' },
];

@Component({
  selector: 'app-interview-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './interview-detail.html',
})
export class InterviewDetail implements OnInit {
  private readonly api = inject(PrepApi);
  private readonly route = inject(ActivatedRoute);
  private readonly applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';
  private draftVersion = 0;

  readonly checklist = checklist;
  readonly questions = questions;
  readonly application = signal<InterviewApplication | null>(null);
  readonly completedTasks = signal<string[]>([]);
  readonly practice = signal<PracticeAnswer[]>([]);
  readonly notes = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly progress = computed(() =>
    this.completedTasks().length + this.practice().filter(item => item.practiced).length,
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.detail(this.applicationId).subscribe({
      next: ({ application, prep }) => {
        this.application.set(application);
        this.completedTasks.set(prep.completedTasks);
        this.practice.set(prep.practice);
        this.notes.set(prep.notes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This application could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  toggleTask(id: string): void {
    this.draftVersion += 1;
    this.saved.set(false);
    this.completedTasks.update(ids =>
      ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id],
    );
  }

  private updateQuestion(id: string, change: Partial<PracticeAnswer>): void {
    this.draftVersion += 1;
    this.saved.set(false);
    this.practice.update(items => {
      const existing = items.find(item => item.questionId === id);
      const updated = { questionId: id, answer: '', practiced: false, ...existing, ...change };
      return existing
        ? items.map(item => item.questionId === id ? updated : item)
        : [...items, updated];
    });
  }

  answerFor(id: string): string {
    return this.practice().find(item => item.questionId === id)?.answer ?? '';
  }

  practiced(id: string): boolean {
    return this.practice().find(item => item.questionId === id)?.practiced ?? false;
  }

  setAnswer(id: string, event: Event): void {
    this.updateQuestion(id, { answer: (event.target as HTMLTextAreaElement).value });
  }

  togglePracticed(id: string): void {
    this.updateQuestion(id, { practiced: !this.practiced(id) });
  }

  setNotes(event: Event): void {
    this.draftVersion += 1;
    this.saved.set(false);
    this.notes.set((event.target as HTMLTextAreaElement).value);
  }

  save(): void {
    if (this.saving()) return;
    const versionBeingSaved = this.draftVersion;
    this.saving.set(true);
    this.saved.set(false);
    this.error.set('');
    this.api.save(this.applicationId, {
      completedTasks: this.completedTasks(),
      practice: this.practice(),
      notes: this.notes(),
    }).subscribe({
      next: () => {
        this.saved.set(this.draftVersion === versionBeingSaved);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Your changes could not be saved. Please try again.');
        this.saving.set(false);
      },
    });
  }
}

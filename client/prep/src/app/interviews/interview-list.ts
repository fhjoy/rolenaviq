import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InterviewApplication, PrepApi } from '../core/prep-api';

@Component({
  selector: 'app-interview-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './interview-list.html',
})
export class InterviewList implements OnInit {
  private readonly api = inject(PrepApi);
  readonly interviews = signal<InterviewApplication[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.interviews().subscribe({
      next: ({ applications }) => {
        this.interviews.set(applications);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}

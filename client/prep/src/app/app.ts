import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { PrepApi } from './core/prep-api';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly api = inject(PrepApi);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  ngOnInit(): void {
    this.checkSession();
  }

  checkSession(): void {
    this.status.set('loading');
    this.api.currentUser().subscribe({
      next: () => this.status.set('ready'),
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          const returnTo = window.location.pathname + window.location.search;
          window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        } else {
          this.status.set('error');
        }
      },
    });
  }
}

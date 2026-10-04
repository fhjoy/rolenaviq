import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { PrepEffects } from '../state/prep.effects';
import { prepFeature } from '../state/prep.reducer';

import { InterviewList } from './interview-list';

describe('InterviewList', () => {
  it('shows an interview returned by the Express API', async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        provideStore({ [prepFeature.name]: prepFeature.reducer }), provideEffects(PrepEffects)],
    }).compileComponents();

    const fixture = TestBed.createComponent(InterviewList);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/prep/interviews').flush({
      applications: [{
        _id: 'test-id', company: 'Northstar Labs', position: 'Frontend Engineer',
        status: 'interview', interviewDate: '2026-11-02T09:00:00.000Z',
        progress: { completedTasks: 1, practicedQuestions: 2, sessions: 1 },
      }],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Northstar Labs');
    expect(page.textContent).toContain('Frontend Engineer');
    expect(page.textContent).toContain('2 questions practiced');
    expect(page.querySelector('a.button')?.textContent).toContain('Prepare for this interview');
    http.verify();
  });
});

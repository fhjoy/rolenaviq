import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { PrepEffects } from '../state/prep.effects';
import { prepFeature } from '../state/prep.reducer';
import { PracticeSessionPage } from './practice-session';

it('records five rated questions and allows a failed save to be retried', async () => {
  await TestBed.configureTestingModule({
    imports: [PracticeSessionPage],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      provideStore({ [prepFeature.name]: prepFeature.reducer }), provideEffects(PrepEffects),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ applicationId: 'test-id' }) } } }],
  }).compileComponents();
  const fixture = TestBed.createComponent(PracticeSessionPage);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/prep/interviews/test-id').flush({
    application: { _id: 'test-id', company: 'Northstar Labs', position: 'Frontend Engineer', status: 'interview' },
    prep: { completedTasks: [], practice: [], notes: '', sessions: [] },
  });
  const page = fixture.componentInstance;
  for (let i = 0; i < 5; i++) {
    page.rate(2);
    page.next();
  }
  const url = '/api/prep/interviews/test-id/sessions';
  const failed = http.expectOne({ method: 'POST', url });
  expect(failed.request.body.results).toHaveLength(5);
  failed.flush({}, { status: 500, statusText: 'Server error' });
  expect(page.error()).toContain('could not be saved');
  page.next();
  http.expectOne({ method: 'POST', url }).flush({
    session: { completedAt: new Date().toISOString(), results: failed.request.body.results },
  });
  expect(page.saved()).toBe(true);
  http.verify();
  fixture.destroy();
});

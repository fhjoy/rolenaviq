import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { PrepEffects } from '../state/prep.effects';
import { prepFeature } from '../state/prep.reducer';
import { QuestionBank } from './question-bank';

it('filters questions and saves the current answer and practice status', async () => {
  await TestBed.configureTestingModule({
    imports: [QuestionBank],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      provideStore({ [prepFeature.name]: prepFeature.reducer }), provideEffects(PrepEffects),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ applicationId: 'test-id' }) } } }],
  }).compileComponents();
  const fixture = TestBed.createComponent(QuestionBank);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/prep/interviews/test-id').flush({
    application: { _id: 'test-id', company: 'Northstar Labs', position: 'Frontend Engineer', status: 'interview' },
    prep: { completedTasks: [], practice: [], notes: '', sessions: [] },
  });
  await fixture.whenStable();
  const page = fixture.componentInstance;
  expect(page.questions).toHaveLength(12);
  page.category.set('Frontend');
  expect(page.filtered()).toHaveLength(4);
  page.setAnswer('accessibility', { target: { value: 'Use labels and keyboard tests.' } } as unknown as Event);
  page.togglePracticed('accessibility');
  expect(page.dirty()).toBe(true);
  page.save();
  const save = http.expectOne({ method: 'PUT', url: '/api/prep/interviews/test-id' });
  expect(save.request.body.practice).toEqual([
    { questionId: 'accessibility', answer: 'Use labels and keyboard tests.', practiced: true },
  ]);
  save.flush({});
  expect(page.dirty()).toBe(false);
  http.verify();
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { PrepEffects } from '../state/prep.effects';
import { prepFeature } from '../state/prep.reducer';
import { InterviewDetail } from './interview-detail';

describe('Interview preparation saving', () => {
  const url = '/api/prep/interviews/test-id';
  const response = {
    application: { _id: 'test-id', company: 'Northstar Labs', position: 'Frontend Engineer', status: 'interview' },
    prep: { completedTasks: [], practice: [], notes: '', sessions: [] },
  };

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [InterviewDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        provideStore({ [prepFeature.name]: prepFeature.reducer }), provideEffects(PrepEffects),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ applicationId: 'test-id' }) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(InterviewDetail);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(url).flush(response);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, page: fixture.componentInstance, http };
  }

  it('enables saving only when changed and confirms a successful save', async () => {
    const { fixture, page, http } = await setup();
    const button = () => fixture.nativeElement.querySelector('.save-bar button') as HTMLButtonElement;
    expect(button().disabled).toBe(true);
    page.toggleTask('company-research');
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    const save = http.expectOne({ method: 'PUT', url });
    expect(save.request.body.completedTasks).toEqual(['company-research']);
    save.flush(response);
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.prep-toast').textContent).toContain('Preparation saved successfully');
    http.verify();
  });

  it('retains edits made while a save is in progress and retries failed saves', async () => {
    const { page, http } = await setup();
    page.toggleTask('company-research');
    page.save();
    page.toggleTask('role-research');
    http.expectOne({ method: 'PUT', url }).flush(response);
    expect(page.dirty()).toBe(true);
    page.save();
    http.expectOne({ method: 'PUT', url }).flush({}, { status: 500, statusText: 'Server error' });
    expect(page.dirty()).toBe(true);
    expect(page.error()).toContain('could not be saved');
    page.save();
    const retry = http.expectOne({ method: 'PUT', url });
    expect(retry.request.body.completedTasks).toEqual(['company-research', 'role-research']);
    retry.flush(response);
    expect(page.dirty()).toBe(false);
    http.verify();
  });
});

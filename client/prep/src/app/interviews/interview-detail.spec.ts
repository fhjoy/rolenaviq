import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { InterviewDetail } from './interview-detail';

describe('Interview preparation saving', () => {
  const url = '/api/prep/interviews/test-id';
  const response = {
    application: { _id: 'test-id', company: 'Northstar Labs', position: 'Frontend Engineer', status: 'interview' },
    prep: { completedTasks: [], practice: [], notes: '' },
  };

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [InterviewDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
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

  it('disables unchanged saves, enables edits, and shows a success toast after saving', async () => {
    const { fixture, page, http } = await setup();
    const button = () => fixture.nativeElement.querySelector('.save-bar button') as HTMLButtonElement;
    expect(button().disabled).toBe(true);
    page.toggleTask('company-research');
    fixture.detectChanges();
    expect(button().disabled).toBe(false);
    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    http.expectOne({ method: 'PUT', url }).flush(response);
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.prep-toast').textContent).toContain('Preparation saved successfully');
    page.toggleTask('role-research');
    expect(page.dirty()).toBe(true);
    page.dismissToast();
    expect(page.toast()).toBe('');
    http.verify();
  });

  it('recognizes reverted changes and retains edits made during a save', async () => {
    const { page, http } = await setup();
    page.toggleTask('company-research');
    page.toggleTask('company-research');
    expect(page.dirty()).toBe(false);
    page.toggleTask('company-research');
    page.save();
    page.toggleTask('role-research');
    http.expectOne({ method: 'PUT', url }).flush(response);
    expect(page.dirty()).toBe(true);
    page.save();
    const retry = http.expectOne({ method: 'PUT', url });
    expect(retry.request.body.completedTasks).toEqual(['company-research', 'role-research']);
    retry.flush(response);
    expect(page.dirty()).toBe(false);
    http.verify();
  });

  it('keeps failed saves retryable and does not show a success toast', async () => {
    const { page, http } = await setup();
    page.notes.set('A new note');
    page.save();
    http.expectOne({ method: 'PUT', url }).flush({}, { status: 500, statusText: 'Server error' });
    expect(page.dirty()).toBe(true);
    expect(page.saving()).toBe(false);
    expect(page.toast()).toBe('');
    expect(page.error()).toContain('could not be saved');
    http.verify();
  });
});

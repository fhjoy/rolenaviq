import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PrepApi } from './prep-api';

describe('PrepApi', () => {
  it('sends preparation updates with the shared session cookie', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const api = TestBed.inject(PrepApi);
    const http = TestBed.inject(HttpTestingController);
    const payload = { completedTasks: ['company-research'], practice: [], notes: 'Be ready.' };

    api.save('abc123', payload).subscribe();
    const request = http.expectOne('/api/prep/interviews/abc123');
    expect(request.request.method).toBe('PUT');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual(payload);
    request.flush({ application: {}, prep: payload });
    http.verify();
  });
});

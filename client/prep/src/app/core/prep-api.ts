import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface InterviewApplication {
  _id: string;
  company: string;
  position: string;
  status: 'interview' | 'technical_interview';
  interviewDate?: string;
}

export interface PracticeAnswer {
  questionId: string;
  answer: string;
  practiced: boolean;
}

export interface PrepData {
  completedTasks: string[];
  practice: PracticeAnswer[];
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class PrepApi {
  private readonly http = inject(HttpClient);

  currentUser() {
    return this.http.get<{ user: { id: string } }>('/api/auth/me', { withCredentials: true });
  }

  interviews() {
    return this.http.get<{ applications: InterviewApplication[] }>('/api/prep/interviews', {
      withCredentials: true,
    });
  }

  detail(applicationId: string) {
    return this.http.get<{ application: InterviewApplication; prep: PrepData }>(
      `/api/prep/interviews/${encodeURIComponent(applicationId)}`,
      { withCredentials: true },
    );
  }

  save(applicationId: string, prep: PrepData) {
    return this.http.put<{ application: InterviewApplication; prep: PrepData }>(
      `/api/prep/interviews/${encodeURIComponent(applicationId)}`,
      prep,
      { withCredentials: true },
    );
  }
}

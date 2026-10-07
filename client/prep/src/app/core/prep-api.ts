import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface InterviewApplication {
  _id: string;
  company: string;
  position: string;
  status: 'interview' | 'technical_interview';
  interviewDate?: string;
  progress?: { completedTasks: number; practicedQuestions: number; sessions: number };
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
  sessions: PracticeSession[];
}

export interface PracticeSession {
  completedAt: string;
  results: { questionId: string; confidence: 1 | 2 | 3 }[];
}

export type EditablePrepData = Pick<PrepData, 'completedTasks' | 'practice' | 'notes'>;

@Injectable({ providedIn: 'root' })
export class PrepApi {
  private readonly http = inject(HttpClient);

  currentUser() {
    return this.http.get<{ user: { id: string; isDemo?: boolean } }>('/api/auth/me', { withCredentials: true });
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

  save(applicationId: string, prep: EditablePrepData) {
    return this.http.put<{ application: InterviewApplication; prep: PrepData }>(
      `/api/prep/interviews/${encodeURIComponent(applicationId)}`,
      prep,
      { withCredentials: true },
    );
  }

  recordSession(applicationId: string, results: PracticeSession['results']) {
    return this.http.post<{ session: PracticeSession }>(
      `/api/prep/interviews/${encodeURIComponent(applicationId)}/sessions`,
      { results },
      { withCredentials: true },
    );
  }
}

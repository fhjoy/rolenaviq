import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Interview prep | RoleNaviq',
    loadComponent: () => import('./interviews/interview-list').then(m => m.InterviewList),
  },
  {
    path: 'interviews/:applicationId/questions',
    title: 'Question bank | RoleNaviq',
    loadComponent: () => import('./interviews/question-bank').then(m => m.QuestionBank),
  },
  {
    path: 'interviews/:applicationId/practice',
    title: 'Practice session | RoleNaviq',
    loadComponent: () => import('./interviews/practice-session').then(m => m.PracticeSessionPage),
  },
  {
    path: 'interviews/:applicationId',
    title: 'Prepare for interview | RoleNaviq',
    loadComponent: () => import('./interviews/interview-detail').then(m => m.InterviewDetail),
  },
  { path: '**', redirectTo: '' },
];

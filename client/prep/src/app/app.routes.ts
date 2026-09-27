import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Interview prep | RoleNaviq',
    loadComponent: () => import('./interviews/interview-list').then(m => m.InterviewList),
  },
  {
    path: 'interviews/:applicationId',
    title: 'Prepare for interview | RoleNaviq',
    loadComponent: () => import('./interviews/interview-detail').then(m => m.InterviewDetail),
  },
  { path: '**', redirectTo: '' },
];

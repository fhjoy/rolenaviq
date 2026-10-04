import { createSelector } from '@ngrx/store';
import { PrepData } from '../core/prep-api';
import { prepFeature } from './prep.reducer';

export const selectInterviews = prepFeature.selectInterviews;
export const selectListLoading = prepFeature.selectListLoading;
export const selectListError = prepFeature.selectListError;

export const selectPlan = (id: string) => createSelector(prepFeature.selectPlans, plans => plans[id]);
export const selectApplication = (id: string) => createSelector(prepFeature.selectApplications, applications => applications[id]);
export const selectLoading = (id: string) => createSelector(prepFeature.selectLoading, loading => loading[id] ?? false);
export const selectSaving = (id: string) => createSelector(prepFeature.selectSaving, saving => saving[id] ?? false);
export const selectRecording = (id: string) => createSelector(prepFeature.selectRecording, recording => recording[id] ?? false);
export const selectError = (id: string) => createSelector(prepFeature.selectErrors, errors => errors[id] ?? '');

function draft(plan: PrepData) {
  return JSON.stringify({ completedTasks: [...plan.completedTasks].sort(),
    practice: [...plan.practice].sort((a, b) => a.questionId.localeCompare(b.questionId)), notes: plan.notes });
}

export const selectDirty = (id: string) => createSelector(
  prepFeature.selectPlans, prepFeature.selectSaved,
  (plans, saved) => !!plans[id] && !!saved[id] && draft(plans[id]) !== draft({ ...saved[id], sessions: [] }),
);

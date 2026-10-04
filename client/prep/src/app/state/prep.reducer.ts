import { createFeature, createReducer, on } from '@ngrx/store';
import { EditablePrepData, InterviewApplication, PrepData } from '../core/prep-api';
import { PrepActions } from './prep.actions';

export interface PrepState {
  interviews: InterviewApplication[];
  applications: Record<string, InterviewApplication>;
  listLoading: boolean;
  listError: boolean;
  plans: Record<string, PrepData>;
  saved: Record<string, EditablePrepData>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  saving: Record<string, boolean>;
  recording: Record<string, boolean>;
}

const initialState: PrepState = {
  interviews: [], applications: {}, listLoading: false, listError: false, plans: {}, saved: {},
  loading: {}, errors: {}, saving: {}, recording: {},
};

function editable(prep: PrepData): EditablePrepData {
  return { completedTasks: prep.completedTasks, practice: prep.practice, notes: prep.notes };
}

function updatePlan(state: PrepState, applicationId: string, update: (plan: PrepData) => PrepData): PrepState {
  const plan = state.plans[applicationId];
  if (!plan) return state;
  return { ...state, plans: { ...state.plans, [applicationId]: update(plan) } };
}

function progress(state: PrepState, applicationId: string, persisted?: EditablePrepData): InterviewApplication[] {
  const plan = state.plans[applicationId];
  if (!plan) return state.interviews;
  const data = persisted ?? plan;
  return state.interviews.map(interview => interview._id === applicationId ? {
    ...interview,
    progress: {
      completedTasks: data.completedTasks.length,
      practicedQuestions: data.practice.filter(item => item.practiced).length,
      sessions: plan.sessions.length,
    },
  } : interview);
}

export const prepFeature = createFeature({
  name: 'prep',
  reducer: createReducer(
    initialState,
    on(PrepActions.loadInterviews, state => ({ ...state, listLoading: true, listError: false })),
    on(PrepActions.interviewsLoaded, (state, { interviews }) => ({ ...state, interviews, listLoading: false })),
    on(PrepActions.interviewsFailed, state => ({ ...state, listLoading: false, listError: true })),
    on(PrepActions.loadPlan, (state, { applicationId }) => ({
      ...state, loading: { ...state.loading, [applicationId]: true },
      errors: { ...state.errors, [applicationId]: '' },
    })),
    on(PrepActions.planLoaded, (state, { applicationId, application, prep }) => ({
      ...state, plans: { ...state.plans, [applicationId]: prep },
      applications: { ...state.applications, [applicationId]: application },
      saved: { ...state.saved, [applicationId]: editable(prep) },
      loading: { ...state.loading, [applicationId]: false },
    })),
    on(PrepActions.planFailed, (state, { applicationId }) => ({
      ...state, loading: { ...state.loading, [applicationId]: false },
      errors: { ...state.errors, [applicationId]: 'This interview could not be loaded.' },
    })),
    on(PrepActions.toggleTask, (state, { applicationId, taskId }) => updatePlan(state, applicationId, plan => ({
      ...plan, completedTasks: plan.completedTasks.includes(taskId)
        ? plan.completedTasks.filter(id => id !== taskId) : [...plan.completedTasks, taskId],
    }))),
    on(PrepActions.setNotes, (state, { applicationId, notes }) => updatePlan(state, applicationId, plan => ({ ...plan, notes }))),
    on(PrepActions.setAnswer, (state, { applicationId, questionId, answer }) => updatePlan(state, applicationId, plan => ({
      ...plan, practice: plan.practice.some(item => item.questionId === questionId)
        ? plan.practice.map(item => item.questionId === questionId ? { ...item, answer } : item)
        : [...plan.practice, { questionId, answer, practiced: false }],
    }))),
    on(PrepActions.togglePracticed, (state, { applicationId, questionId }) => updatePlan(state, applicationId, plan => ({
      ...plan, practice: plan.practice.some(item => item.questionId === questionId)
        ? plan.practice.map(item => item.questionId === questionId ? { ...item, practiced: !item.practiced } : item)
        : [...plan.practice, { questionId, answer: '', practiced: true }],
    }))),
    on(PrepActions.savePlan, (state, { applicationId }) => ({
      ...state, saving: { ...state.saving, [applicationId]: true },
      errors: { ...state.errors, [applicationId]: '' },
    })),
    on(PrepActions.planSaved, (state, { applicationId, prep }) => {
      const updated = { ...state, saved: { ...state.saved, [applicationId]: prep },
        saving: { ...state.saving, [applicationId]: false } };
      return { ...updated, interviews: progress(updated, applicationId, prep) };
    }),
    on(PrepActions.saveFailed, (state, { applicationId }) => ({
      ...state, saving: { ...state.saving, [applicationId]: false },
      errors: { ...state.errors, [applicationId]: 'Your changes could not be saved. Please try again.' },
    })),
    on(PrepActions.recordSession, (state, { applicationId }) => ({
      ...state, recording: { ...state.recording, [applicationId]: true },
      errors: { ...state.errors, [applicationId]: '' },
    })),
    on(PrepActions.sessionRecorded, (state, { applicationId, session }) => {
      const updated = updatePlan({ ...state, recording: { ...state.recording, [applicationId]: false } },
        applicationId, plan => ({ ...plan, sessions: [...plan.sessions, session].slice(-20) }));
      return { ...updated, interviews: progress(updated, applicationId) };
    }),
    on(PrepActions.sessionFailed, (state, { applicationId }) => ({
      ...state, recording: { ...state.recording, [applicationId]: false },
      errors: { ...state.errors, [applicationId]: 'Practice could not be saved. Please try again.' },
    })),
  ),
});

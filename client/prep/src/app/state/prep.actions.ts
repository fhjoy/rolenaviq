import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { EditablePrepData, InterviewApplication, PracticeSession, PrepData } from '../core/prep-api';

export const PrepActions = createActionGroup({
  source: 'Interview Prep',
  events: {
    'Load Interviews': emptyProps(),
    'Interviews Loaded': props<{ interviews: InterviewApplication[] }>(),
    'Interviews Failed': emptyProps(),
    'Load Plan': props<{ applicationId: string }>(),
    'Plan Loaded': props<{ applicationId: string; application: InterviewApplication; prep: PrepData }>(),
    'Plan Failed': props<{ applicationId: string }>(),
    'Toggle Task': props<{ applicationId: string; taskId: string }>(),
    'Set Notes': props<{ applicationId: string; notes: string }>(),
    'Set Answer': props<{ applicationId: string; questionId: string; answer: string }>(),
    'Toggle Practiced': props<{ applicationId: string; questionId: string }>(),
    'Save Plan': props<{ applicationId: string; prep: EditablePrepData }>(),
    'Plan Saved': props<{ applicationId: string; prep: EditablePrepData }>(),
    'Save Failed': props<{ applicationId: string }>(),
    'Record Session': props<{ applicationId: string; results: PracticeSession['results'] }>(),
    'Session Recorded': props<{ applicationId: string; session: PracticeSession }>(),
    'Session Failed': props<{ applicationId: string }>(),
  },
});

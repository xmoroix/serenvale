import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface ReportEditorState {
  isVisible: boolean;
  currentReport: {
    aiContent: string;
    patientInfo: {
      id: string;
      name: string;
      date: string;
      modality: string;
      studyDescription?: string;
      accessionNumber?: string;
    };
    studyId?: string;
    reportId?: string;
    status: 'draft' | 'final';
  } | null;
}

interface ReportEditorActions {
  openEditor: (report: NonNullable<ReportEditorState['currentReport']>) => void;
  closeEditor: () => void;
  updateReportContent: (content: string) => void;
}

type ReportEditorStore = ReportEditorState & ReportEditorActions;

const initialState: ReportEditorState = {
  isVisible: false,
  currentReport: null,
};

export const useReportEditorStore = createWithEqualityFn<ReportEditorStore>()(
  devtools(
    (set) => ({
      ...initialState,

      openEditor: (report) => {
        set({ isVisible: true, currentReport: report }, false, 'openEditor');
      },

      closeEditor: () => {
        set({ isVisible: false, currentReport: null }, false, 'closeEditor');
      },

      updateReportContent: (content) => {
        set(
          (state) => ({
            currentReport: state.currentReport
              ? { ...state.currentReport, aiContent: content }
              : null,
          }),
          false,
          'updateReportContent',
        );
      },
    }),
    { name: 'ReportEditorStore' },
  ),
  shallow,
);

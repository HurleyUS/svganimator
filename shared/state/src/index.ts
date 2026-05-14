/**
 * Shared State Src Index public module surface.
 */
// fallow-ignore-file coverage-gaps
import {
  addSvgProjectCollaborator,
  createStarterSvgProject,
  createSvgExportPayload,
  type SvgExportFormat,
} from "@canaveral/svg";
import { create } from "zustand";

type LaunchState = {
  checklistOpen: boolean;
  setChecklistOpen: (checklistOpen: boolean) => void;
};

/** Shared starter store for launch checklist UI state. */
export const useLaunchStore = create<LaunchState>((set) => ({
  checklistOpen: true,
  setChecklistOpen: (checklistOpen) => {
    set({ checklistOpen });
  },
}));

const starterProject = createStarterSvgProject("Launch sequence");

const createProjectName = (count: number) => `Untitled animation ${count + 1}`;

type SvgWorkspaceState = {
  addCollaborator: (email: string) => void;
  createProject: () => void;
  currentTime: number;
  exportFormat: SvgExportFormat;
  exportSelectedProject: () => ReturnType<typeof createSvgExportPayload>;
  projects: Array<typeof starterProject>;
  selectElement: (elementId: string) => void;
  selectProject: (projectId: string) => void;
  selectedElementIds: Array<string>;
  selectedProjectId: string;
  setExportFormat: (format: SvgExportFormat) => void;
  setCurrentTime: (time: number) => void;
  updateProjectName: (name: string) => void;
};

/** Shared SVG animation project workspace state for every runtime shell. */
export const useSvgWorkspaceStore = create<SvgWorkspaceState>((set, get) => ({
  addCollaborator: (email) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === state.selectedProjectId
          ? addSvgProjectCollaborator(project, email)
          : project,
      ),
    }));
  },
  createProject: () => {
    set((state) => {
      const project = createStarterSvgProject(
        createProjectName(state.projects.length),
      );

      return {
        projects: [project, ...state.projects],
        selectedProjectId: project.id,
      };
    });
  },
  currentTime: 0,
  exportFormat: "svg",
  exportSelectedProject: () => {
    const state = get();
    const project =
      state.projects.find(
        (candidate) => candidate.id === state.selectedProjectId,
      ) ?? starterProject;

    return createSvgExportPayload(project, state.exportFormat);
  },
  projects: [starterProject],
  selectElement: (elementId) => {
    set({ selectedElementIds: [elementId] });
  },
  selectProject: (projectId) => {
    set({
      currentTime: 0,
      selectedElementIds: [],
      selectedProjectId: projectId,
    });
  },
  selectedElementIds: [],
  selectedProjectId: starterProject.id,
  setExportFormat: (format) => {
    set({ exportFormat: format });
  },
  setCurrentTime: (time) => {
    set({ currentTime: time });
  },
  updateProjectName: (name) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === state.selectedProjectId
          ? {
              ...project,
              name: name.trim() || project.name,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    }));
  },
}));

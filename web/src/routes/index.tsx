// fallow-ignore-file coverage-gaps

import { appConfig } from "@canaveral/config";
import { useSvgWorkspaceStore } from "@canaveral/state";
import {
  applySvgAnimations,
  type createSvgExportPayload,
  findSvgElementById,
  getAnimatableProperties,
  type SvgAnimationProject,
  type SvgElement,
  svgExportFormatSchema,
} from "@canaveral/svg";
import { Button } from "@canaveral/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { renderSvgAnimationExport } from "../lib/export-renderer";
import { sendContactEmail } from "../lib/resend";
import { createCheckoutSession } from "../lib/stripe";

const collaboratorFormSchema = z.object({
  email: z.string().email(),
});

/** Home route for the SVG Animator product workspace. */
export const Route = createFileRoute("/")({
  component: Home,
});

const downloadPayload = (
  payload: ReturnType<typeof createSvgExportPayload>,
) => {
  const url = URL.createObjectURL(
    new Blob([payload.contents], { type: payload.mimeType }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.name;
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadRenderedExport = (
  payload: Awaited<ReturnType<typeof renderSvgAnimationExport>>,
) => {
  const bytes = Uint8Array.from(atob(payload.base64), (character) =>
    character.charCodeAt(0),
  );
  const url = URL.createObjectURL(
    new Blob([bytes], { type: payload.mimeType }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.name;
  anchor.click();
  URL.revokeObjectURL(url);
};

const renderPreviewElement = (element: SvgElement) => {
  if (!element.isVisible) {
    return null;
  }

  const childElements = element.children
    .filter((child) => child.isVisible)
    .map((child) => (
      <g key={child.id}>
        <title>{child.name}</title>
      </g>
    ));

  return (
    <g key={element.id}>
      <title>{element.name}</title>
      {element.type === "circle" ? (
        <circle {...element.attributes}>{childElements}</circle>
      ) : null}
      {element.type === "rect" ? (
        <rect {...element.attributes}>{childElements}</rect>
      ) : null}
      {element.type === "path" ? (
        <path {...element.attributes}>{childElements}</path>
      ) : null}
      {element.type === "g" ? (
        <g {...element.attributes}>{childElements}</g>
      ) : null}
    </g>
  );
};

function SvgPreview({
  currentTime,
  project,
}: {
  currentTime: number;
  project: SvgAnimationProject;
}) {
  const animatedElements = applySvgAnimations(
    project.elements,
    currentTime,
    project.keyframes,
  );

  return (
    <svg aria-label={project.name} role="img" viewBox={project.viewBox}>
      <title>{project.name}</title>
      {animatedElements.map(renderPreviewElement)}
    </svg>
  );
}

function AppHeader() {
  return (
    <header className="svga-topbar">
      <div>
        <p className="eyebrow">SVG Animator</p>
        <h1>{appConfig.name} project studio</h1>
      </div>
      <nav aria-label="Account actions" className="svga-auth">
        <Button className="svga-secondary">Log in</Button>
        <Button>Create account</Button>
      </nav>
    </header>
  );
}

function ProjectSidebar() {
  const projects = useSvgWorkspaceStore((state) => state.projects);
  const selectedProjectId = useSvgWorkspaceStore(
    (state) => state.selectedProjectId,
  );
  const selectProject = useSvgWorkspaceStore((state) => state.selectProject);
  const createProject = useSvgWorkspaceStore((state) => state.createProject);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;

  if (!selectedProject) {
    return null;
  }

  return (
    <aside className="svga-sidebar" aria-label="Projects">
      <div className="svga-panel-head">
        <h2>Projects</h2>
        <Button onClick={createProject}>New</Button>
      </div>
      <div className="svga-project-list">
        {projects.map((project) => (
          <button
            className={
              project.id === selectedProject.id
                ? "svga-project is-active"
                : "svga-project"
            }
            key={project.id}
            onClick={() => selectProject(project.id)}
            type="button"
          >
            <span>{project.name}</span>
            <small>{project.keyframes.length} keyframes</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

function AnimationStage() {
  const projects = useSvgWorkspaceStore((state) => state.projects);
  const selectedProjectId = useSvgWorkspaceStore(
    (state) => state.selectedProjectId,
  );
  const currentTime = useSvgWorkspaceStore((state) => state.currentTime);
  const setCurrentTime = useSvgWorkspaceStore((state) => state.setCurrentTime);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;

  if (!selectedProject) {
    return null;
  }

  return (
    <section className="svga-stage" aria-label="Animation preview">
      <div className="svga-canvas">
        <SvgPreview currentTime={currentTime} project={selectedProject} />
      </div>
      <input
        aria-label="Scrub timeline"
        className="svga-scrubber"
        max={selectedProject.duration}
        min="0"
        onChange={(event) => setCurrentTime(Number(event.currentTarget.value))}
        type="range"
        value={currentTime}
      />
      <ul aria-label="Timeline" className="svga-timeline">
        {selectedProject.keyframes.map((keyframe) => (
          <li className="svga-keyframe" key={keyframe.id}>
            <span>{keyframe.elementId}</span>
            <strong>{keyframe.property}</strong>
            <small>{keyframe.time}ms</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectInspector() {
  const projects = useSvgWorkspaceStore((state) => state.projects);
  const selectedProjectId = useSvgWorkspaceStore(
    (state) => state.selectedProjectId,
  );
  const addCollaborator = useSvgWorkspaceStore(
    (state) => state.addCollaborator,
  );
  const exportFormat = useSvgWorkspaceStore((state) => state.exportFormat);
  const setExportFormat = useSvgWorkspaceStore(
    (state) => state.setExportFormat,
  );
  const exportSelectedProject = useSvgWorkspaceStore(
    (state) => state.exportSelectedProject,
  );
  const selectedElementIds = useSvgWorkspaceStore(
    (state) => state.selectedElementIds,
  );
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;
  const inviteForm = useForm({
    defaultValues: {
      email: "",
    },
  });

  if (!selectedProject) {
    return null;
  }

  const selectedElement = selectedElementIds[0]
    ? findSvgElementById(selectedProject.elements, selectedElementIds[0])
    : undefined;
  const animatableProperties = getAnimatableProperties(selectedElement);

  return (
    <aside className="svga-inspector" aria-label="Project tools">
      <section>
        <h2>{selectedProject.name}</h2>
        <p>
          Standalone exports are plain `.svg` documents with embedded CSS
          keyframes and a small timeline script. No `.svganim` format is
          introduced.
        </p>
        <div className="svga-track-list">
          {animatableProperties.map((property) => (
            <span key={property.property}>{property.label}</span>
          ))}
        </div>
      </section>

      <section>
        <h3>Invite collaborators</h3>
        <form
          className="svga-inline-form"
          onSubmit={inviteForm.handleSubmit((values) => {
            const parsed = collaboratorFormSchema.parse(values);
            addCollaborator(parsed.email);
            inviteForm.reset();
          })}
        >
          <input
            placeholder="designer@example.com"
            type="email"
            {...inviteForm.register("email")}
          />
          <Button type="submit">Invite</Button>
        </form>
        <ul className="svga-collabs">
          {selectedProject.collaborators.map((collaborator) => (
            <li key={collaborator.email}>
              <span>{collaborator.email}</span>
              <small>{collaborator.role}</small>
            </li>
          ))}
        </ul>
        <Button
          className="svga-export"
          onClick={() =>
            void sendContactEmail({
              data: {
                email: appConfig.supportEmail,
                message: `Invite collaborators to ${selectedProject.name}`,
              },
            })
          }
        >
          Send invite email
        </Button>
      </section>

      <section>
        <h3>Export</h3>
        <div className="svga-format-grid">
          {svgExportFormatSchema.options.map((format) => (
            <button
              className={
                format === exportFormat
                  ? "svga-format is-active"
                  : "svga-format"
              }
              key={format}
              onClick={() => setExportFormat(format)}
              type="button"
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <Button
          className="svga-export"
          onClick={async () => {
            if (exportFormat === "gif" || exportFormat === "mkv") {
              const payload = await renderSvgAnimationExport({
                data: {
                  format: exportFormat,
                  project: selectedProject,
                },
              });
              downloadRenderedExport(payload);

              return;
            }

            downloadPayload(exportSelectedProject());
          }}
        >
          Export {exportFormat.toUpperCase()}
        </Button>
        <p className="svga-note">
          GIF and MKV render on the server from static SVG frames generated from
          the same timeline model.
        </p>
        <Button
          className="svga-export svga-secondary"
          onClick={() =>
            void createCheckoutSession({
              data: { priceId: "price_export_pack" },
            })
          }
        >
          Open export billing
        </Button>
      </section>
    </aside>
  );
}

function Home() {
  return (
    <main className="svga-shell">
      <AppHeader />
      <section className="svga-layout">
        <ProjectSidebar />
        <AnimationStage />
        <ProjectInspector />
      </section>
    </main>
  );
}

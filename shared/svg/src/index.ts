/**
 * Shared Svg Src Index public module surface.
 */
// fallow-ignore-file coverage-gaps
import { z } from "zod";

const keyframeValueSchema = z.union([z.string(), z.number()]);
const animatableGroupSchema = z.enum([
  "Transform",
  "Appearance",
  "Stroke",
  "Path",
  "Filter",
]);

/** Supported deliverable targets for animated SVG projects. */
export const svgExportFormatSchema = z.enum(["svg", "lottie", "gif", "mkv"]);

/** Editable SVG node schema shared across web, desktop, and mobile. */
export const svgElementSchema = z.object({
  attributes: z.record(z.string(), z.string()),
  children: z.array(
    z.object({
      attributes: z.record(z.string(), z.string()),
      children: z.array(z.never()),
      id: z.string().min(1),
      isLocked: z.boolean(),
      isVisible: z.boolean(),
      name: z.string().min(1),
      type: z.string().min(1),
    }),
  ),
  id: z.string().min(1),
  isLocked: z.boolean(),
  isVisible: z.boolean(),
  name: z.string().min(1),
  type: z.string().min(1),
});

/** Timeline keyframe schema for one animated SVG attribute. */
export const svgKeyframeSchema = z.object({
  easing: z.string().min(1),
  elementId: z.string().min(1),
  id: z.string().min(1),
  property: z.string().min(1),
  time: z.number().min(0),
  value: keyframeValueSchema,
});

/** Email collaborator schema for project invitations and permissions. */
export const svgCollaboratorSchema = z.object({
  email: z.string().email(),
  invitedAt: z.string().datetime(),
  role: z.enum(["owner", "editor", "viewer"]),
});

/** Cross-runtime project schema for SVG animation workspaces. */
export const svgAnimationProjectSchema = z.object({
  collaborators: z.array(svgCollaboratorSchema),
  duration: z.number().positive(),
  elements: z.array(svgElementSchema),
  id: z.string().min(1),
  keyframes: z.array(svgKeyframeSchema),
  loop: z.boolean(),
  name: z.string().min(1),
  updatedAt: z.string().datetime(),
  viewBox: z.string().min(1),
});

/** File export payload schema for renderer and server export flows. */
export const svgExportPayloadSchema = z.object({
  contents: z.string().min(1),
  extension: z.string().min(1),
  format: svgExportFormatSchema,
  mimeType: z.string().min(1),
  name: z.string().min(1),
});

/** Animatable SVG property catalog item schema. */
export const animatablePropertySchema = z.object({
  fallback: keyframeValueSchema,
  group: animatableGroupSchema,
  label: z.string().min(1),
  property: z.string().min(1),
  shortcut: z.string().min(1),
});

/** Inferred SVG element shape shared by editor packages. */
export type SvgElement = z.infer<typeof svgElementSchema>;

/** Inferred SVG keyframe shape shared by editor packages. */
export type SvgKeyframe = z.infer<typeof svgKeyframeSchema>;

/** Inferred collaborator shape shared by editor packages. */
export type SvgCollaborator = z.infer<typeof svgCollaboratorSchema>;

/** Inferred animation project shape shared by editor packages. */
export type SvgAnimationProject = z.infer<typeof svgAnimationProjectSchema>;

/** Inferred export format union shared by editor packages. */
export type SvgExportFormat = z.infer<typeof svgExportFormatSchema>;

/** Inferred export payload shape shared by editor packages. */
export type SvgExportPayload = z.infer<typeof svgExportPayloadSchema>;

/** Inferred animatable property shape shared by editor packages. */
export type AnimatableProperty = z.infer<typeof animatablePropertySchema>;

const now = () => new Date().toISOString();

const nodeId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const escapeScript = (value: string) =>
  value.replaceAll("</script>", "<\\/script>");

const safePercent = (time: number, duration: number) =>
  Math.max(0, Math.min(100, (time / duration) * 100)).toFixed(2);

const animationName = (elementId: string, property: string) =>
  `svga_${slugify(elementId)}_${slugify(property)}`;

const commonProperties = [
  {
    fallback: "translate(0 0)",
    group: "Transform",
    label: "Position",
    property: "transform",
    shortcut: "P",
  },
  {
    fallback: "0 0",
    group: "Transform",
    label: "Origin",
    property: "transform-origin",
    shortcut: "A",
  },
  {
    fallback: "1",
    group: "Transform",
    label: "Scale",
    property: "scale",
    shortcut: "S",
  },
  {
    fallback: "0deg",
    group: "Transform",
    label: "Rotate",
    property: "rotate",
    shortcut: "R",
  },
  {
    fallback: "1",
    group: "Appearance",
    label: "Opacity",
    property: "opacity",
    shortcut: "O",
  },
  {
    fallback: "#ffffff",
    group: "Appearance",
    label: "Fill color",
    property: "fill",
    shortcut: "C",
  },
  {
    fallback: "#000000",
    group: "Stroke",
    label: "Stroke color",
    property: "stroke",
    shortcut: "B",
  },
  {
    fallback: "1",
    group: "Stroke",
    label: "Stroke width",
    property: "stroke-width",
    shortcut: "W",
  },
  {
    fallback: "none",
    group: "Filter",
    label: "Filters",
    property: "filter",
    shortcut: "L",
  },
].map((property) => animatablePropertySchema.parse(property));

const pathProperties = [
  {
    fallback: "",
    group: "Path",
    label: "Morph",
    property: "d",
    shortcut: "M",
  },
].map((property) => animatablePropertySchema.parse(property));

const parseTranslateX = (value: string) => {
  const match = /^translateX\((-?\d+(?:\.\d+)?)px?\)$/.exec(value.trim());

  return match?.[1] ? Number(match[1]) : null;
};

const frameTrackValue = (track: Array<SvgKeyframe>, time: number) => {
  const sorted = track.toSorted((first, second) => first.time - second.time);
  const first = sorted[0];
  const last = sorted.at(-1);

  if (!(first && last)) {
    return "";
  }

  if (time <= first.time) {
    return String(first.value);
  }

  if (time >= last.time) {
    return String(last.value);
  }

  const next = sorted.find((keyframe) => keyframe.time >= time) ?? last;
  const previous =
    sorted.findLast((keyframe) => keyframe.time <= time) ?? first;
  const span = Math.max(1, next.time - previous.time);
  const progress = (time - previous.time) / span;
  const previousTranslate = parseTranslateX(String(previous.value));
  const nextTranslate = parseTranslateX(String(next.value));

  if (previousTranslate !== null && nextTranslate !== null) {
    const value =
      previousTranslate + (nextTranslate - previousTranslate) * progress;

    return `translate(${value.toFixed(3)} 0)`;
  }

  return String(previous.value);
};

const keyframesForProperty = (
  elementId: string,
  property: string,
  keyframes: Array<SvgKeyframe>,
) =>
  keyframes
    .filter(
      (keyframe) =>
        keyframe.elementId === elementId && keyframe.property === property,
    )
    .toSorted((first, second) => first.time - second.time);

const boundaryKeyframeValue = (
  time: number,
  keyframes: Array<SvgKeyframe>,
  defaultValue: string | number,
) => {
  const first = keyframes[0];
  const last = keyframes.at(-1);

  if (!(first && last)) {
    return defaultValue;
  }

  if (time <= first.time) {
    return first.value;
  }

  if (time >= last.time) {
    return last.value;
  }

  return null;
};

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const matchNumber = (
  match: RegExpExecArray | null,
  index: number,
  fallback: number,
) => {
  const value = match?.[index];

  return value ? Number.parseFloat(value) : fallback;
};

const interpolateNumbers = (
  from: string | number,
  to: string | number,
  progress: number,
) => {
  if (typeof from === "number" && typeof to === "number") {
    return lerp(from, to, progress);
  }

  const previousNumber =
    typeof from === "string" ? Number.parseFloat(from) : Number.NaN;
  const nextNumber =
    typeof to === "string" ? Number.parseFloat(to) : Number.NaN;

  return Number.isFinite(previousNumber) && Number.isFinite(nextNumber)
    ? lerp(previousNumber, nextNumber, progress)
    : null;
};

const transformNumbers = (value: string) => {
  const translate =
    /translate\((-?\d+(?:\.\d+)?)(?:[\s,]+(-?\d+(?:\.\d+)?))?\)/.exec(value);
  const scale = /scale\((-?\d+(?:\.\d+)?)(?:[\s,]+(-?\d+(?:\.\d+)?))?\)/.exec(
    value,
  );
  const rotate = /rotate\((-?\d+(?:\.\d+)?)/.exec(value);
  const scaleX = matchNumber(scale, 1, 1);

  return {
    rotation: matchNumber(rotate, 1, 0),
    scaleX,
    scaleY: matchNumber(scale, 2, scaleX),
    x: matchNumber(translate, 1, 0),
    y: matchNumber(translate, 2, 0),
  };
};

const interpolateTransform = (from: string, to: string, progress: number) => {
  const previous = transformNumbers(from);
  const next = transformNumbers(to);

  return [
    `translate(${lerp(previous.x, next.x, progress)} ${lerp(previous.y, next.y, progress)})`,
    `scale(${lerp(previous.scaleX, next.scaleX, progress)} ${lerp(previous.scaleY, next.scaleY, progress)})`,
    `rotate(${lerp(previous.rotation, next.rotation, progress)})`,
  ].join(" ");
};

const interpolateValue = (
  property: string,
  previous: SvgKeyframe,
  next: SvgKeyframe,
  progress: number,
) => {
  const numericValue = interpolateNumbers(previous.value, next.value, progress);

  if (numericValue !== null) {
    return numericValue;
  }

  if (property === "transform") {
    return interpolateTransform(
      String(previous.value),
      String(next.value),
      progress,
    );
  }

  return progress < 0.5 ? previous.value : next.value;
};

const animatedValue = (
  elementId: string,
  property: string,
  time: number,
  keyframes: Array<SvgKeyframe>,
  defaultValue: string | number,
) => {
  const propertyKeyframes = keyframesForProperty(
    elementId,
    property,
    keyframes,
  );
  const boundaryValue = boundaryKeyframeValue(
    time,
    propertyKeyframes,
    defaultValue,
  );

  if (boundaryValue !== null) {
    return boundaryValue;
  }

  const nextIndex = propertyKeyframes.findIndex(
    (keyframe) => keyframe.time > time,
  );
  const previous = propertyKeyframes[Math.max(0, nextIndex - 1)];
  const next = propertyKeyframes[nextIndex];

  if (!(previous && next)) {
    return defaultValue;
  }

  return interpolateValue(
    property,
    previous,
    next,
    (time - previous.time) / (next.time - previous.time),
  );
};

const frameAttributes = (
  node: SvgElement,
  project: SvgAnimationProject,
  time: number,
) => {
  const entries = Object.entries({ ...node.attributes, id: node.id });
  const tracks = groupedKeyframes(project.keyframes).get(node.id);

  if (!tracks) {
    return Object.fromEntries(entries);
  }

  for (const [property, track] of tracks) {
    entries.push([property, frameTrackValue(track, time)]);
  }

  return Object.fromEntries(entries);
};

const allowedSvgTypes = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "g",
  "text",
  "image",
  "use",
  "defs",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "filter",
]);

const parseElementNode = (node: Element) => {
  const type = node.tagName;

  if (!allowedSvgTypes.has(type) && type !== "svg") {
    return null;
  }

  const attributes = Object.fromEntries(
    Array.from(node.attributes).map((attribute) => [
      attribute.name,
      attribute.value,
    ]),
  );
  const children = Array.from(node.children)
    .map((child) => {
      const childType = child.tagName;

      if (!allowedSvgTypes.has(childType) && childType !== "svg") {
        return null;
      }

      const childAttributes = Object.fromEntries(
        Array.from(child.attributes).map((attribute) => [
          attribute.name,
          attribute.value,
        ]),
      );
      const childAttributeMap = new Map(Object.entries(childAttributes));
      const childId = childAttributeMap.get("id");

      return {
        attributes: childAttributes,
        children: [],
        id: childId ?? nodeId(childType),
        isLocked: false,
        isVisible: true,
        name: childId ?? `${childType}-0`,
        type: childType,
      };
    })
    .filter((child) => child !== null);
  const attributeMap = new Map(Object.entries(attributes));
  const id = attributeMap.get("id");

  return svgElementSchema.parse({
    attributes,
    children,
    id: id ?? nodeId(type),
    isLocked: false,
    isVisible: true,
    name: id ?? `${type}-${children.length}`,
    type,
  });
};

const sampleElements = [
  {
    attributes: {
      cx: "180",
      cy: "160",
      fill: "#22c55e",
      id: "orb",
      r: "44",
    },
    children: [],
    id: "orb",
    isLocked: false,
    isVisible: true,
    name: "Launch orb",
    type: "circle",
  },
  {
    attributes: {
      fill: "#0f172a",
      height: "96",
      id: "panel",
      rx: "8",
      width: "220",
      x: "110",
      y: "220",
    },
    children: [],
    id: "panel",
    isLocked: false,
    isVisible: true,
    name: "Control panel",
    type: "rect",
  },
];

const sampleKeyframes = [
  {
    easing: "ease-in-out",
    elementId: "orb",
    id: "orb-start",
    property: "transform",
    time: 0,
    value: "translateX(0)",
  },
  {
    easing: "ease-in-out",
    elementId: "orb",
    id: "orb-mid",
    property: "transform",
    time: 1200,
    value: "translateX(180px)",
  },
  {
    easing: "ease-in-out",
    elementId: "orb",
    id: "orb-end",
    property: "transform",
    time: 2400,
    value: "translateX(0)",
  },
];

const groupedKeyframes = (keyframes: Array<SvgKeyframe>) => {
  const grouped = new Map<string, Map<string, Array<SvgKeyframe>>>();

  for (const keyframe of keyframes) {
    const elementTracks =
      grouped.get(keyframe.elementId) ?? new Map<string, Array<SvgKeyframe>>();
    const propertyTrack = elementTracks.get(keyframe.property) ?? [];
    propertyTrack.push(keyframe);
    elementTracks.set(keyframe.property, propertyTrack);
    grouped.set(keyframe.elementId, elementTracks);
  }

  return grouped;
};

const renderElement = (
  node: SvgElement,
  project: SvgAnimationProject,
  time: number,
) => {
  if (!node.isVisible) {
    return "";
  }

  const attributes = Object.entries(frameAttributes(node, project, time))
    .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
    .join(" ");
  const children = node.children
    .filter((child) => child.isVisible)
    .map((child) => {
      const childAttributes = Object.entries({
        ...child.attributes,
        id: child.id,
      })
        .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`)
        .join(" ");

      return `<${child.type} ${childAttributes}></${child.type}>`;
    })
    .join("");

  return `<${node.type} ${attributes}>${children}</${node.type}>`;
};

const renderNode = (node: SvgElement) => renderElement(node, emptyProject, 0);

const emptyProject = svgAnimationProjectSchema.parse({
  collaborators: [],
  duration: 1,
  elements: [],
  id: "empty",
  keyframes: [],
  loop: false,
  name: "Empty",
  updatedAt: now(),
  viewBox: "0 0 1 1",
});

const renderStandaloneStyles = (project: SvgAnimationProject) => {
  const blocks = [];

  for (const [elementId, tracks] of groupedKeyframes(project.keyframes)) {
    for (const [property, track] of tracks) {
      const name = animationName(elementId, property);
      const keyframes = track
        .toSorted((first, second) => first.time - second.time)
        .map((keyframe) => {
          const percent = safePercent(keyframe.time, project.duration);
          return `    ${percent}% { ${property}: ${String(keyframe.value)}; }`;
        })
        .join("\n");
      blocks.push(
        `#${elementId} { animation: ${name} ${project.duration}ms infinite linear; }`,
      );
      blocks.push(`@keyframes ${name} {\n${keyframes}\n  }`);
    }
  }

  return `<style>\n  ${blocks.join("\n  ")}\n</style>`;
};

const renderStandaloneScript = (project: SvgAnimationProject) => {
  const timeline = JSON.stringify({
    duration: project.duration,
    keyframes: project.keyframes,
    loop: project.loop,
  });

  return `<script><![CDATA[
  window.__SVGANIMATOR_PROJECT__ = ${escapeScript(timeline)};
  document.documentElement.dataset.svganimator = "standalone";
]]></script>`;
};

const lottieLayerForElement = (element: SvgElement) => ({
  ddd: 0,
  ind: element.id,
  ip: 0,
  ks: {
    o: { k: 100 },
    p: { k: [0, 0, 0] },
    r: { k: 0 },
    s: { k: [100, 100, 100] },
  },
  nm: element.name,
  op: 120,
  shapes: [
    {
      it: [],
      nm: element.name,
      ty: "gr",
    },
  ],
  sr: 1,
  st: 0,
  ty: 4,
});

/** Creates a valid starter SVG animation project without using a proprietary file format. */
export function createStarterSvgProject(name: string) {
  return svgAnimationProjectSchema.parse({
    collaborators: [],
    duration: 2400,
    elements: sampleElements,
    id: `project-${slugify(name) || "untitled"}`,
    keyframes: sampleKeyframes,
    loop: true,
    name,
    updatedAt: now(),
    viewBox: "0 0 440 360",
  });
}

/** Serializes a project into a standalone browser-executable SVG document. */
export function serializeStandaloneSvg(project: SvgAnimationProject) {
  const parsed = svgAnimationProjectSchema.parse(project);
  const content = parsed.elements.map(renderNode).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeAttribute(parsed.viewBox)}" role="img" aria-label="${escapeAttribute(parsed.name)}">
  <title>${escapeAttribute(parsed.name)}</title>
  ${renderStandaloneStyles(parsed)}
  ${content}
  ${renderStandaloneScript(parsed)}
</svg>`;
}

/** Serializes one animation frame as static SVG for video and GIF renderers. */
export function serializeSvgFrame(project: SvgAnimationProject, time: number) {
  const parsed = svgAnimationProjectSchema.parse(project);
  const content = parsed.elements
    .map((element) => renderElement(element, parsed, time))
    .join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeAttribute(parsed.viewBox)}" role="img" aria-label="${escapeAttribute(parsed.name)}">
  <title>${escapeAttribute(parsed.name)}</title>
  ${content}
</svg>`;
}

/** Serializes a project into a Lottie JSON handoff document for renderer pipelines. */
export function serializeLottie(project: SvgAnimationProject) {
  const parsed = svgAnimationProjectSchema.parse(project);
  const frames = Math.max(1, Math.round(parsed.duration / 1000) * 60);

  return JSON.stringify(
    {
      assets: [],
      fr: 60,
      h: 360,
      ip: 0,
      layers: parsed.elements.map(lottieLayerForElement),
      markers: parsed.keyframes.map((keyframe) => ({
        cm: `${keyframe.elementId}:${keyframe.property}:${String(keyframe.value)}`,
        dr: 1,
        tm: Math.round((keyframe.time / parsed.duration) * frames),
      })),
      nm: parsed.name,
      op: frames,
      v: "5.12.2",
      w: 440,
    },
    undefined,
    2,
  );
}

/** Creates an export payload for SVG, Lottie, or queued raster/video renderer formats. */
export function createSvgExportPayload(
  project: SvgAnimationProject,
  format: SvgExportFormat,
) {
  const parsed = svgAnimationProjectSchema.parse(project);
  const basename = slugify(parsed.name) || "animation";

  if (format === "svg") {
    return svgExportPayloadSchema.parse({
      contents: serializeStandaloneSvg(parsed),
      extension: "svg",
      format,
      mimeType: "image/svg+xml",
      name: `${basename}.svg`,
    });
  }

  if (format === "lottie") {
    return svgExportPayloadSchema.parse({
      contents: serializeLottie(parsed),
      extension: "json",
      format,
      mimeType: "application/json",
      name: `${basename}.lottie.json`,
    });
  }

  return svgExportPayloadSchema.parse({
    contents: JSON.stringify(
      {
        format,
        project: parsed,
        source: serializeStandaloneSvg(parsed),
      },
      undefined,
      2,
    ),
    extension: "json",
    format,
    mimeType: "application/json",
    name: `${basename}.${format}.render-job.json`,
  });
}

/** Adds an email collaborator to a project with an editor role by default. */
export function addSvgProjectCollaborator(
  project: SvgAnimationProject,
  email: string,
) {
  return svgAnimationProjectSchema.parse({
    ...project,
    collaborators: [
      ...project.collaborators.filter(
        (collaborator) => collaborator.email !== email,
      ),
      {
        email,
        invitedAt: now(),
        role: "editor",
      },
    ],
    updatedAt: now(),
  });
}

/** Finds the first SVG element with the requested id in a nested element tree. */
export function findSvgElementById(elements: Array<SvgElement>, id: string) {
  const stack = [...elements];

  while (stack.length > 0) {
    const element = stack.shift();

    if (!element) {
      continue;
    }

    if (element.id === id) {
      return element;
    }

    stack.push(...element.children);
  }

  return undefined;
}

/** Collects every SVG element that matches a predicate. */
export function collectSvgElements(
  elements: Array<SvgElement>,
  predicate: (element: SvgElement) => boolean,
) {
  const matches = [];
  const stack = [...elements];

  while (stack.length > 0) {
    const element = stack.shift();

    if (!element) {
      continue;
    }

    if (predicate(element)) {
      matches.push(element);
    }

    stack.push(...element.children);
  }

  return matches;
}

/** Returns animatable properties for the currently selected SVG element. */
export function getAnimatableProperties(element?: SvgElement) {
  if (!element) {
    return commonProperties;
  }

  return element.type === "path" ||
    new Map(Object.entries(element.attributes)).has("d")
    ? [...pathProperties, ...commonProperties]
    : commonProperties;
}

/** Reads the current value for an animatable property on an SVG element. */
export function getAnimatableValue(
  element: SvgElement,
  property: AnimatableProperty,
) {
  return element.attributes[property.property] ?? property.fallback;
}

/** Creates a keyframe payload from an SVG element and animatable property. */
export function createSvgAnimationKeyframe(
  element: SvgElement,
  property: AnimatableProperty,
  time: number,
) {
  return {
    easing: "ease-in-out",
    elementId: element.id,
    property: property.property,
    time,
    value: getAnimatableValue(element, property),
  };
}

/** Applies timeline keyframes to an SVG element tree for the requested playback time. */
export function applySvgAnimations(
  elements: Array<SvgElement>,
  time: number,
  keyframes: Array<SvgKeyframe>,
) {
  return elements.map((element) => {
    const properties = Array.from(
      new Set(
        keyframes
          .filter((keyframe) => keyframe.elementId === element.id)
          .map((keyframe) => keyframe.property),
      ),
    );
    const attributes = Object.fromEntries(Object.entries(element.attributes));

    for (const property of properties) {
      attributes[property] = String(
        animatedValue(
          element.id,
          property,
          time,
          keyframes,
          element.attributes[property] ?? (property === "opacity" ? 1 : ""),
        ),
      );
    }

    return svgElementSchema.parse({
      ...element,
      attributes,
      children: element.children.map((child) =>
        svgElementSchema.shape.children.element.parse({
          ...child,
          attributes: frameAttributes(
            child,
            { ...emptyProject, keyframes },
            time,
          ),
        }),
      ),
    });
  });
}

/** Parses uploaded SVG markup into editor elements fitted to the default artboard. */
export function parseSvgMarkup(svgString: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgString, "image/svg+xml");
  const svgRoot = document.querySelector("svg");

  if (!svgRoot) {
    return [];
  }

  return Array.from(svgRoot.children)
    .map(parseElementNode)
    .filter((element) => element !== null);
}

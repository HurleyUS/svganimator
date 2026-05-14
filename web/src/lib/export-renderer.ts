/**
 * Web Src Lib Export Renderer public module surface.
 */
// fallow-ignore-file coverage-gaps

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  serializeSvgFrame,
  svgAnimationProjectSchema,
  svgExportFormatSchema,
} from "@canaveral/svg";
import { Resvg } from "@resvg/resvg-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const runFile = (file: string, args: Array<string>) =>
  new Promise((resolve, reject) => {
    execFile(file, args, (error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve(null);
    });
  });

const renderInputSchema = z.object({
  format: svgExportFormatSchema.extract(["gif", "mkv"]),
  project: svgAnimationProjectSchema,
});

const renderMetadata = {
  fps: 30,
  height: 720,
  width: 880,
};

const extensionForFormat = (
  format: z.infer<typeof renderInputSchema>["format"],
) => (format === "gif" ? "gif" : "mkv");

const mimeTypeForFormat = (
  format: z.infer<typeof renderInputSchema>["format"],
) => (format === "gif" ? "image/gif" : "video/x-matroska");

const frameName = (index: number) =>
  `frame-${String(index).padStart(4, "0")}.svg`;
const rasterFrameName = (index: number) =>
  `frame-${String(index).padStart(4, "0")}.png`;

const writeSvgFrames = async (
  directory: string,
  project: z.infer<typeof svgAnimationProjectSchema>,
) => {
  const frameCount = Math.max(
    2,
    Math.ceil((project.duration / 1000) * renderMetadata.fps),
  );

  for (let index = 0; index < frameCount; index += 1) {
    const time = Math.min(
      project.duration,
      (index / renderMetadata.fps) * 1000,
    );
    const svg = serializeSvgFrame(project, time);
    const renderer = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: renderMetadata.width,
      },
    });
    await writeFile(join(directory, frameName(index)), svg);
    await writeFile(
      join(directory, rasterFrameName(index)),
      renderer.render().asPng(),
    );
  }

  return frameCount;
};

const renderGif = async (directory: string, outputPath: string) => {
  const palettePath = join(directory, "palette.png");
  const inputPattern = join(directory, "frame-%04d.png");
  await runFile("ffmpeg", [
    "-y",
    "-framerate",
    String(renderMetadata.fps),
    "-i",
    inputPattern,
    "-vf",
    `scale=${renderMetadata.width}:${renderMetadata.height}:flags=lanczos,palettegen`,
    palettePath,
  ]);
  await runFile("ffmpeg", [
    "-y",
    "-framerate",
    String(renderMetadata.fps),
    "-i",
    inputPattern,
    "-i",
    palettePath,
    "-lavfi",
    `scale=${renderMetadata.width}:${renderMetadata.height}:flags=lanczos [x]; [x][1:v] paletteuse`,
    "-loop",
    "0",
    outputPath,
  ]);
};

const renderMkv = async (directory: string, outputPath: string) => {
  await runFile("ffmpeg", [
    "-y",
    "-framerate",
    String(renderMetadata.fps),
    "-i",
    join(directory, "frame-%04d.png"),
    "-vf",
    `scale=${renderMetadata.width}:${renderMetadata.height}:flags=lanczos`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);
};

/** Renders animated SVG projects into binary GIF or Matroska files through ffmpeg. */
export const renderSvgAnimationExport = createServerFn({ method: "POST" })
  .inputValidator((input) => renderInputSchema.parse(input))
  .handler(async ({ data }) => {
    const directory = await mkdtemp(join(tmpdir(), "canaveral-svg-render-"));
    const extension = extensionForFormat(data.format);
    const outputPath = join(directory, `animation.${extension}`);

    try {
      await writeSvgFrames(directory, data.project);

      if (data.format === "gif") {
        await renderGif(directory, outputPath);
      } else {
        await renderMkv(directory, outputPath);
      }

      const output = await readFile(outputPath);

      return {
        base64: output.toString("base64"),
        mimeType: mimeTypeForFormat(data.format),
        name: `${data.project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`,
      };
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

/** Derive public URL paths for a work project thumbnail and hover video. */
export function resolveWorkProjectMedia(imagePath) {
  if (!imagePath) {
    return { imageSrc: "", hoverVideo: null };
  }

  const normalized = imagePath.replace(/^public\/?/, "");
  const imageSrc = normalized.startsWith("/") ? normalized : `/${normalized}`;

  const match = imagePath.match(/work\/([^/]+)\//i);
  const projectName = match?.[1] ?? null;
  const hoverVideo = projectName
    ? `/work/${projectName}/Thumbnail-Hover.mp4`
    : null;

  return { imageSrc, hoverVideo };
}

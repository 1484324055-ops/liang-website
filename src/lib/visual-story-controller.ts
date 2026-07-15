export const VISUAL_STORY_SECTIONS = [
  'hero',
  'whyme',
  'roi',
  'cases',
  'certificates',
  'services',
  'process',
  'faq',
  'contact',
] as const;

export type VisualStorySection = (typeof VISUAL_STORY_SECTIONS)[number];

export interface VisualStoryUpdate {
  section: VisualStorySection;
  index: number;
  progress: number;
}

interface VisualStoryControllerOptions {
  root: HTMLElement;
  onUpdate: (update: VisualStoryUpdate) => void;
}

export interface VisualStoryController {
  refresh: () => void;
  dispose: () => void;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function createVisualStoryController({
  root,
  onUpdate,
}: VisualStoryControllerOptions): VisualStoryController {
  const sections = VISUAL_STORY_SECTIONS.map((section, index) => {
    const element = document.querySelector<HTMLElement>(`[data-story-section="${section}"]`);
    return element ? { element, section, index } : null;
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  let animationFrame = 0;
  let disposed = false;
  let previousSection = '';
  let previousProgress = -1;

  function update() {
    animationFrame = 0;
    if (disposed || sections.length === 0) return;

    const focusY = window.innerHeight * 0.48;
    let active = sections[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of sections) {
      const rect = candidate.element.getBoundingClientRect();
      const distance =
        rect.top <= focusY && rect.bottom >= focusY
          ? 0
          : Math.min(Math.abs(rect.top - focusY), Math.abs(rect.bottom - focusY));

      if (distance < smallestDistance) {
        active = candidate;
        smallestDistance = distance;
      }
    }

    const rect = active.element.getBoundingClientRect();
    const progress = clamp((focusY - rect.top) / Math.max(rect.height, 1));
    const progressChanged = Math.abs(progress - previousProgress) > 0.002;
    const sectionChanged = active.section !== previousSection;

    if (!progressChanged && !sectionChanged) return;

    previousSection = active.section;
    previousProgress = progress;
    root.dataset.storySection = active.section;
    root.style.setProperty('--story-progress', progress.toFixed(4));
    root.style.setProperty('--story-section-index', String(active.index));
    sections.forEach(({ element }) => {
      element.classList.toggle('story-section-current', element === active.element);
    });

    const detail: VisualStoryUpdate = {
      section: active.section,
      index: active.index,
      progress,
    };

    onUpdate(detail);
    window.dispatchEvent(new CustomEvent<VisualStoryUpdate>('visual-story:update', { detail }));
  }

  function scheduleUpdate() {
    if (disposed || animationFrame) return;
    animationFrame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('orientationchange', scheduleUpdate);
  scheduleUpdate();

  return {
    refresh: scheduleUpdate,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    },
  };
}

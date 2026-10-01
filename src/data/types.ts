export type Category = "software" | "architecture";

/** One processed image: the largest rung, plus the ladder and its placeholder. */
export interface Img {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** Tiny inline WebP, shown while the real file loads. */
  blur: string;
  /**
   * Frames in the source. Anything above 1 also carries `video`: an animated
   * GIF in an <img> cannot be told where to start, so motion is served as video
   * and the stills above become its poster.
   */
  frames: number;
  /**
   * Present when the source was a video. The still above is then its poster,
   * shown until the clip is big enough on screen to be worth playing.
   */
  video?: {
    /** Full rendition, for heroes and prose. */
    src: string;
    /** Small rendition, for grid tiles and other thumbnails. */
    small: string;
    type: string;
    width: number;
    height: number;
    duration: number;
  };
}

/** A `## Heading` block from project.md, already rendered to HTML. */
export interface Section {
  id: string;
  title: string;
  html: string;
}

export interface GeneratedProject {
  slug: string;
  title: string;
  year: string;
  /** A project may belong to more than one discipline. */
  categories: Category[];
  blurb: string;
  href?: string;
  role?: string;
  stack?: string[];
  status?: string;
  /** Research credits. */
  program?: string;
  advisor?: string;
  collaborators?: string[];
  /** Tailwind gradient, used wherever a project has no images yet. */
  tone: string;
  /** Width / height of the tile. From the hero image unless overridden. */
  ratio: number;
  order: number;
  hero: Img | null;
  gallery: Img[];
  sections: Section[];
}

export type Project = GeneratedProject;

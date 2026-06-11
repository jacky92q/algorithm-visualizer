import type { Palette } from './palette';

export type Category = 'sorting' | 'searching' | 'pathfinding' | 'stack' | 'tree' | 'dp' | 'math';

export interface CodeLine {
  text: string;
  indent: number;
}

export interface BaseStep {
  /** 0-based index into sourceCode of the line being executed. */
  line: number;
  /** Short human caption shown under the stage (Korean primary). */
  caption: string;
  /** Optional English caption. Pages show this when lang='en'. */
  captionEn?: string;
  /** Optional badge label (PUSH / SWAP / VISIT …). */
  action?: string;
  /** Optional English badge label. */
  actionEn?: string;
  /** Optional tone for the badge / accent. */
  tone?: 'neutral' | 'compare' | 'active' | 'good' | 'bad';
}

export interface RenderCtx {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Tween progress 0..1 between the previous and current step. */
  t: number;
  /** Absolute elapsed time in seconds (for idle / looping animation). */
  time: number;
  /** Device pixel ratio already applied to the context transform. */
  dpr: number;
  palette: Palette;
  /** Current UI language, so renderers can localize text they draw directly. */
  lang: 'ko' | 'en';
}

export interface Renderer<S extends BaseStep = BaseStep> {
  /** Draw the current frame, optionally interpolating from prev → curr by t. */
  draw(rc: RenderCtx, prev: S | null, curr: S): void;
}

/** Optional English version of algorithm text fields. */
export interface AlgorithmMetaEn {
  name: string;
  tagline: string;
  hook: string;
  summary: string;
  keyPoints: string[];
  steps: string[];
  defaultInput: string;
  inputHint: string;
}

/**
 * A selectable preset input. Used by algorithms whose input cannot be freely
 * typed (e.g. pathfinding mazes): the input modal shows these as buttons.
 * `value` is the raw string handed to `generate(input)`.
 */
export interface PresetOption {
  label: string;
  labelEn?: string;
  value: string;
}

export interface AlgorithmMeta {
  id: string;
  category: Category;
  name: string;
  /** Short English subtitle. */
  tagline: string;
  /** One-line hook (Korean primary). */
  hook: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  space: string;
  summary: string;
  keyPoints: string[];
  /** Walk-through bullet points for the description page. */
  steps: string[];
  defaultInput: string;
  inputHint: string;
  accent: 'teal' | 'brown' | 'amber' | 'coral' | 'rose' | 'plum';
  /** Emoji / glyph for catalog cards. */
  glyph: string;
  /** Optional full English translation of text fields. */
  en?: AlgorithmMetaEn;
  /**
   * Optional selectable presets. When present, the input modal shows these as
   * buttons instead of a free-text field (for fixed-layout algorithms such as
   * pathfinding mazes).
   */
  presets?: PresetOption[];
}

export interface Algorithm<S extends BaseStep = BaseStep> {
  meta: AlgorithmMeta;
  sourceCode: CodeLine[];
  /** Build the full step trace for the given raw input string. */
  generate(input: string): S[];
  /** Fresh renderer instance (renderers may hold layout cache). */
  createRenderer(): Renderer<S>;
}

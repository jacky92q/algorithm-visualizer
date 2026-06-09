import type { Palette } from './palette';

export type Category = 'sorting' | 'searching' | 'pathfinding' | 'stack' | 'tree';

export interface CodeLine {
  text: string;
  indent: number;
}

// A single frame in an algorithm run. Algorithms extend this with their own
// state fields; the player and renderer treat them opaquely.
export interface BaseStep {
  /** 0-based index into sourceCode of the line being executed. */
  line: number;
  /** Short human caption shown under the stage. */
  caption: string;
  /** Optional badge label (PUSH / SWAP / VISIT ...). */
  action?: string;
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
}

export interface Renderer<S extends BaseStep = BaseStep> {
  /** Draw the current frame, optionally interpolating from prev → curr by t. */
  draw(rc: RenderCtx, prev: S | null, curr: S): void;
}

export interface AlgorithmMeta {
  id: string;
  category: Category;
  name: string;
  /** Short English subtitle. */
  tagline: string;
  /** One-line Korean hook. */
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
}

export interface Algorithm<S extends BaseStep = BaseStep> {
  meta: AlgorithmMeta;
  sourceCode: CodeLine[];
  /** Build the full step trace for the given raw input string. */
  generate(input: string): S[];
  /** Fresh renderer instance (renderers may hold layout cache). */
  createRenderer(): Renderer<S>;
}

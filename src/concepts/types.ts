import type { BaseStep, Renderer } from '../core/types';

export type Tone = 'neutral' | 'compare' | 'active' | 'good' | 'bad';

/** A participant in a protocol exchange (client, server, router …). */
export interface Actor {
  id: string;
  label: string;
  labelEn?: string;
  /** Small subtitle, e.g. an IP address. */
  sub?: string;
  subEn?: string;
  glyph?: string;
  /** Accent hex for this actor's node + lifeline. */
  color?: string;
}

/** A single message travelling between two actors. */
export interface FlowMsg {
  from: string; // actor id
  to: string; // actor id
  label: string;
  labelEn?: string;
  tone?: Tone;
  /** Dashed arrow — used for responses / "thinking". */
  dashed?: boolean;
  /** A small lock / tag glyph drawn before the label. */
  tag?: string;
}

/** One animation frame of a flow concept. */
export interface FlowStep extends BaseStep {
  actors: Actor[];
  /** All messages up to and including this step; last one is "in flight". */
  msgs: FlowMsg[];
  phase?: string;
  phaseEn?: string;
}

export interface ConceptMetaEn {
  name: string;
  blurb: string;
  summary: string;
}

export interface ConceptMeta {
  id: string;
  /** Category id, e.g. 'network'. */
  category: string;
  name: string;
  /** One-line hook. */
  blurb: string;
  /** 2–3 sentence explanation for the intro / info panel. */
  summary: string;
  glyph: string;
  accent: 'teal' | 'brown' | 'amber' | 'coral' | 'rose' | 'plum';
  en?: ConceptMetaEn;
}

export interface Concept {
  meta: ConceptMeta;
  /** Fixed scene list (no user input). */
  build(): FlowStep[];
  createRenderer(): Renderer<FlowStep>;
}

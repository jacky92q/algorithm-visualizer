import type { Actor, FlowMsg, FlowStep, Tone } from '../types';

/** One scripted exchange line; expands into a single FlowStep. */
export interface FlowEvent {
  from: string;
  to: string;
  label: string;
  labelEn?: string;
  tone?: Tone;
  dashed?: boolean;
  tag?: string;
  phase?: string;
  phaseEn?: string;
  caption: string;
  captionEn: string;
  action?: string;
}

export interface IntroEvent {
  phase?: string;
  phaseEn?: string;
  caption: string;
  captionEn: string;
  action?: string;
}

/**
 * Turn a list of scripted events into cumulative FlowSteps. Each step exposes
 * every message up to that point; the renderer animates the last one in flight.
 * An optional intro step shows the actors before any message is sent.
 */
export function buildFlow(actors: Actor[], events: FlowEvent[], intro?: IntroEvent): FlowStep[] {
  const steps: FlowStep[] = [];
  if (intro) {
    steps.push({
      line: 0,
      caption: intro.caption,
      captionEn: intro.captionEn,
      action: intro.action,
      tone: 'neutral',
      actors,
      msgs: [],
      phase: intro.phase,
      phaseEn: intro.phaseEn,
    });
  }
  events.forEach((ev, i) => {
    const msgs: FlowMsg[] = events.slice(0, i + 1).map((e) => ({
      from: e.from,
      to: e.to,
      label: e.label,
      labelEn: e.labelEn,
      tone: e.tone,
      dashed: e.dashed,
      tag: e.tag,
    }));
    steps.push({
      line: 0,
      caption: ev.caption,
      captionEn: ev.captionEn,
      action: ev.action,
      tone: ev.tone,
      actors,
      msgs,
      phase: ev.phase,
      phaseEn: ev.phaseEn,
    });
  });
  return steps;
}

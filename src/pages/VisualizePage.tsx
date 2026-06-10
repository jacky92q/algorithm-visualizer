import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getAlgorithm } from '../algorithms';
import CanvasStage from '../components/CanvasStage';
import CodePanel from '../components/CodePanel';
import { usePlayer } from '../hooks/usePlayer';
import { useLang } from '../i18n/LangContext';

const toneClass: Record<string, string> = {
  neutral: 'b-neutral',
  active: 'b-active',
  compare: 'b-compare',
  good: 'b-good',
  bad: 'b-bad',
};

export default function VisualizePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const algo = id ? getAlgorithm(id) : undefined;

  const [input, setInput] = useState(algo?.meta.defaultInput ?? '');
  const [draft, setDraft] = useState(input);
  const [editOpen, setEditOpen] = useState(false);

  const steps = useMemo(() => (algo ? algo.generate(input) : []), [algo, input]);
  const player = usePlayer(steps.length);

  if (!algo) {
    return (
      <div className="missing">
        <p>{t('viz.missing')}</p>
        <button onClick={() => navigate('/')}>{t('viz.goHome')}</button>
      </div>
    );
  }

  const step = steps[player.index] ?? steps[0];
  const m = algo.meta;
  const progress = steps.length > 1 ? player.index / (steps.length - 1) : 0;

  const caption = lang === 'en' ? (step?.captionEn ?? step?.caption) : step?.caption;
  const action = lang === 'en' ? (step?.actionEn ?? step?.action) : step?.action;

  const inputHint = lang === 'en' && m.en ? m.en.inputHint : m.inputHint;

  const applyInput = () => {
    const defaultIn = lang === 'en' && m.en ? m.en.defaultInput : m.defaultInput;
    setInput(draft.trim() || defaultIn);
    setEditOpen(false);
  };

  const applyPreset = (value: string) => {
    setInput(value);
    setDraft(value);
    setEditOpen(false);
    player.reset();
  };

  return (
    <motion.main
      className={`viz accent-${m.accent}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="viz-frame">
        {/* top bar */}
        <div className="viz-top">
          <button className="icon-btn" onClick={() => navigate(`/algo/${m.id}`)} aria-label="back">
            ←
          </button>
          <div className="viz-titlewrap">
            <span className="viz-name">{lang === 'en' && m.en ? m.en.name : m.name}</span>
            <span className="viz-complex">
              {m.time} · {m.space}
            </span>
          </div>
          <button className="icon-btn" onClick={() => { setDraft(input); setEditOpen(true); }} aria-label="edit input">
            ✏️
          </button>
        </div>

        {/* action badge + caption */}
        <div className="viz-status">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={player.index}
              className={`action-badge ${toneClass[step?.tone ?? 'neutral']}`}
              initial={{ scale: 0.6, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              {action ?? ''}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* the stage */}
        <CanvasStage algorithm={algo} steps={steps} index={player.index} />

        {/* caption */}
        <div className="viz-caption">
          <AnimatePresence mode="wait">
            <motion.p
              key={player.index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {caption}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* code */}
        <CodePanel code={algo.sourceCode} activeLine={step?.line ?? 0} compact />

        {/* progress */}
        <div className="viz-progress">
          <div className="prog-track" onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const ratio = (e.clientX - r.left) / r.width;
            player.seek(Math.round(ratio * (steps.length - 1)));
          }}>
            <motion.div className="prog-fill" animate={{ width: `${progress * 100}%` }} transition={{ ease: 'linear', duration: 0.2 }} />
            <motion.div className="prog-knob" animate={{ left: `${progress * 100}%` }} transition={{ ease: 'linear', duration: 0.2 }} />
          </div>
          <span className="prog-count">
            {player.index + 1} / {steps.length}
          </span>
        </div>

        {/* controls */}
        <div className="viz-controls">
          <button className="ctrl" onClick={player.reset} aria-label="reset">⏮︎</button>
          <button className="ctrl" onClick={player.prev} aria-label="prev">‹</button>
          <button className="ctrl play" onClick={player.toggle} aria-label="play">
            {player.isPlaying ? '⏸︎' : '▶︎'}
          </button>
          <button className="ctrl" onClick={player.next} aria-label="next">›</button>
          <button className="ctrl" onClick={player.goEnd} aria-label="end">⏭︎</button>
          <div className="speed-wrap">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                className={`speed ${player.speed === s ? 'on' : ''}`}
                onClick={() => player.setSpeed(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* input modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditOpen(false)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              {m.presets ? (
                <>
                  <h3>{t('viz.presetTitle')}</h3>
                  <p className="modal-hint">{inputHint}</p>
                  <div className="preset-list">
                    {m.presets.map((p) => {
                      const selected = input === p.value;
                      return (
                        <button
                          key={p.value}
                          className={`preset-btn ${selected ? 'on' : ''}`}
                          onClick={() => applyPreset(p.value)}
                        >
                          <span className="preset-label">
                            {lang === 'en' ? (p.labelEn ?? p.label) : p.label}
                          </span>
                          {selected && <span className="preset-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h3>{t('viz.inputTitle')}</h3>
                  <p className="modal-hint">{inputHint}</p>
                  <input
                    className="modal-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyInput()}
                    autoFocus
                  />
                  <div className="modal-actions">
                    <button className="btn-ghost" onClick={() => setDraft(lang === 'en' && m.en ? m.en.defaultInput : m.defaultInput)}>
                      {t('viz.default')}
                    </button>
                    <button className="btn-solid" onClick={applyInput}>{t('viz.apply')}</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

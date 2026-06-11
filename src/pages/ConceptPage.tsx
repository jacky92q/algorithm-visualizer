import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getConcept } from '../concepts';
import CanvasStage from '../components/CanvasStage';
import { usePlayer } from '../hooks/usePlayer';
import { useLang } from '../i18n/LangContext';

const toneClass: Record<string, string> = {
  neutral: 'b-neutral',
  active: 'b-active',
  compare: 'b-compare',
  good: 'b-good',
  bad: 'b-bad',
};

export default function ConceptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const concept = id ? getConcept(id) : undefined;

  const [infoOpen, setInfoOpen] = useState(false);
  const steps = useMemo(() => (concept ? concept.build() : []), [concept]);
  const player = usePlayer(steps.length);

  if (!concept) {
    return (
      <div className="missing">
        <p>{t('viz.missing')}</p>
        <button onClick={() => navigate('/')}>{t('viz.goHome')}</button>
      </div>
    );
  }

  const m = concept.meta;
  const step = steps[player.index] ?? steps[0];
  const progress = steps.length > 1 ? player.index / (steps.length - 1) : 0;
  const caption = lang === 'en' ? (step?.captionEn ?? step?.caption) : step?.caption;
  const action = step?.action;
  const name = lang === 'en' && m.en ? m.en.name : m.name;
  const summary = lang === 'en' && m.en ? m.en.summary : m.summary;

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
          <button className="icon-btn" onClick={() => navigate('/')} aria-label="back">←</button>
          <div className="viz-titlewrap">
            <span className="viz-name">{name}</span>
            <span className="viz-complex">{t('concept.tag')}</span>
          </div>
          <button className="icon-btn" onClick={() => setInfoOpen(true)} aria-label="info">ℹ︎</button>
        </div>

        {/* action badge */}
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
        <CanvasStage source={concept} steps={steps} index={player.index} />

        {/* caption */}
        <div className="viz-caption concept-caption">
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
          <span className="prog-count">{player.index + 1} / {steps.length}</span>
        </div>

        {/* controls */}
        <div className="viz-controls">
          <button className="ctrl" onClick={player.reset} aria-label="reset">«</button>
          <button className="ctrl" onClick={player.prev} aria-label="prev">‹</button>
          <button className={`ctrl play ${player.isPlaying ? 'is-playing' : ''}`} onClick={player.toggle} aria-label="play" />
          <button className="ctrl" onClick={player.next} aria-label="next">›</button>
          <button className="ctrl" onClick={player.goEnd} aria-label="end">»</button>
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

      {/* info modal */}
      <AnimatePresence>
        {infoOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInfoOpen(false)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{m.glyph} {name}</h3>
              <p className="modal-summary">{summary}</p>
              <div className="modal-actions">
                <button className="btn-solid" onClick={() => setInfoOpen(false)}>{t('concept.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

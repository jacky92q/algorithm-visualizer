import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getAlgorithm } from '../algorithms';
import CanvasStage from '../components/CanvasStage';
import CodePanel from '../components/CodePanel';
import { usePlayer } from '../hooks/usePlayer';

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
  const algo = id ? getAlgorithm(id) : undefined;

  const [input, setInput] = useState(algo?.meta.defaultInput ?? '');
  const [draft, setDraft] = useState(input);
  const [editOpen, setEditOpen] = useState(false);

  const steps = useMemo(() => (algo ? algo.generate(input) : []), [algo, input]);
  const player = usePlayer(steps.length);

  if (!algo) {
    return (
      <div className="missing">
        <p>알고리즘을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')}>← 홈으로</button>
      </div>
    );
  }

  const step = steps[player.index] ?? steps[0];
  const m = algo.meta;
  const progress = steps.length > 1 ? player.index / (steps.length - 1) : 0;

  const applyInput = () => {
    setInput(draft.trim() || m.defaultInput);
    setEditOpen(false);
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
            <span className="viz-name">{m.name}</span>
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
              {step?.action ?? ''}
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
              {step?.caption}
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
          <button className="ctrl" onClick={player.reset} aria-label="reset">⏮</button>
          <button className="ctrl" onClick={player.prev} aria-label="prev">‹</button>
          <button className="ctrl play" onClick={player.toggle} aria-label="play">
            {player.isPlaying ? '⏸' : '▶'}
          </button>
          <button className="ctrl" onClick={player.next} aria-label="next">›</button>
          <button className="ctrl" onClick={player.goEnd} aria-label="end">⏭</button>
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
              <h3>입력값 바꾸기</h3>
              <p className="modal-hint">{m.inputHint}</p>
              <input
                className="modal-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyInput()}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => setDraft(m.defaultInput)}>기본값</button>
                <button className="btn-solid" onClick={applyInput}>적용</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

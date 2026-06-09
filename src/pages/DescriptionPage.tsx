import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { getAlgorithm } from '../algorithms';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function DescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const algo = id ? getAlgorithm(id) : undefined;

  if (!algo) {
    return (
      <div className="missing">
        <p>알고리즘을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')}>← 홈으로</button>
      </div>
    );
  }
  const m = algo.meta;

  const stagger = (i: number) => ({
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: 0.18 + i * 0.07 },
  });

  return (
    <motion.main
      className={`desc accent-${m.accent}`}
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="back-btn" onClick={() => navigate('/')}>
        ← 목록
      </button>

      <div className="desc-inner">
        <motion.div
          className="desc-glyph"
          initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
        >
          {m.glyph}
        </motion.div>

        <motion.span className="desc-cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          {m.category.toUpperCase()}
        </motion.span>
        <motion.h1 className="desc-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          {m.name}
        </motion.h1>
        <motion.p className="desc-tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
          {m.hook}
        </motion.p>

        <motion.div className="stat-row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat">
            <span className="stat-label">시간복잡도</span>
            <span className="stat-value">{m.time}</span>
          </div>
          <div className="stat">
            <span className="stat-label">공간복잡도</span>
            <span className="stat-value">{m.space}</span>
          </div>
          <div className="stat">
            <span className="stat-label">난이도</span>
            <span className={`stat-value diff-${m.difficulty.toLowerCase()}`}>{m.difficulty}</span>
          </div>
        </motion.div>

        <motion.p className="desc-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
          {m.summary}
        </motion.p>

        <div className="desc-cols">
          <div className="desc-card">
            <h3>핵심 포인트</h3>
            <ul className="key-list">
              {m.keyPoints.map((p, i) => (
                <motion.li key={i} {...stagger(i)}>
                  <span className="bullet">✦</span>
                  {p}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="desc-card">
            <h3>동작 순서</h3>
            <ol className="step-list">
              {m.steps.map((p, i) => (
                <motion.li key={i} {...stagger(i)}>
                  <span className="step-num">{i + 1}</span>
                  {p}
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        <motion.button
          className="cta"
          onClick={() => navigate(`/algo/${m.id}/run`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          ▶ 시각화 시작하기
        </motion.button>
      </div>
    </motion.main>
  );
}

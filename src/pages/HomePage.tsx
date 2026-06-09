import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALGORITHMS, CATEGORIES, algorithmsByCategory } from '../algorithms';

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <motion.main
      className="home"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="home-hero">
        <motion.div
          className="hero-badge"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 20 }}
        >
          ✦ ALGORITHM VISUALIZER
        </motion.div>
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          알고리즘이 <span className="accent-teal">살아 움직이는</span>
          <br />
          가장 아름다운 방법
        </motion.h1>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {ALGORITHMS.length}개의 핵심 알고리즘을 단계별 애니메이션과 코드 하이라이트로.
        </motion.p>
      </header>

      <div className="catalog">
        {CATEGORIES.map((cat, ci) => {
          const items = algorithmsByCategory(cat.id);
          if (!items.length) return null;
          return (
            <section className="cat-section" key={cat.id}>
              <motion.div
                className="cat-head"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + ci * 0.06 }}
              >
                <span className="cat-glyph">{cat.glyph}</span>
                <div>
                  <h2>{cat.ko}</h2>
                  <span className="cat-en">{cat.label} · {cat.blurb}</span>
                </div>
              </motion.div>
              <div className="card-grid">
                {items.map((algo, i) => (
                  <motion.button
                    key={algo.meta.id}
                    className={`algo-card accent-${algo.meta.accent}`}
                    onClick={() => navigate(`/algo/${algo.meta.id}`)}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.12 + ci * 0.05 + i * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
                    whileHover={{ y: -6, scale: 1.025 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="card-glyph">{algo.meta.glyph}</div>
                    <div className="card-body">
                      <div className="card-name">{algo.meta.name}</div>
                      <div className="card-hook">{algo.meta.hook}</div>
                    </div>
                    <div className="card-foot">
                      <span className="chip chip-time">{algo.meta.time}</span>
                      <span className={`chip chip-diff diff-${algo.meta.difficulty.toLowerCase()}`}>
                        {algo.meta.difficulty}
                      </span>
                    </div>
                    <span className="card-arrow">→</span>
                  </motion.button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="home-foot">
        <span>Made for shorts · Canvas + React + TypeScript</span>
      </footer>
    </motion.main>
  );
}

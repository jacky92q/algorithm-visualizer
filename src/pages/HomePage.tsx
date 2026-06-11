import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALGORITHMS, CATEGORIES, algorithmsByCategory } from '../algorithms';
import { CONCEPTS, CONCEPT_CATEGORIES, conceptsByCategory } from '../concepts';
import { useLang } from '../i18n/LangContext';

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const meta = (algo: (typeof ALGORITHMS)[0]) => {
    const m = algo.meta;
    return {
      name: lang === 'en' && m.en ? m.en.name : m.name,
      hook: lang === 'en' && m.en ? m.en.hook : m.hook,
    };
  };

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
          {t('home.badge')}
        </motion.div>
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {t('home.title.pre')}<span className="accent-teal">{t('home.title.accent')}</span>
          <br />
          {t('home.title.post')}
        </motion.h1>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t('home.sub').replace('{n}', String(ALGORITHMS.length))}
        </motion.p>

        <motion.button
          className="settings-btn"
          onClick={() => setSettingsOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          aria-label="Language settings"
          title={t('lang.title')}
        >
          🌐
        </motion.button>
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
                  <h2>{t(`cat.${cat.id}.name`)}</h2>
                  <span className="cat-en">{cat.label} · {t(`cat.${cat.id}.blurb`)}</span>
                </div>
              </motion.div>
              <div className="card-grid">
                {items.map((algo, i) => {
                  const { name, hook } = meta(algo);
                  return (
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
                        <div className="card-name">{name}</div>
                        <div className="card-hook">{hook}</div>
                      </div>
                      <div className="card-foot">
                        <span className="chip chip-time">{algo.meta.time}</span>
                        <span className={`chip chip-diff diff-${algo.meta.difficulty.toLowerCase()}`}>
                          {algo.meta.difficulty}
                        </span>
                      </div>
                      <span className="card-arrow">→</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {CONCEPTS.length > 0 && (
        <div className="catalog catalog-concepts">
          <div className="section-divider">
            <span>{t('home.concepts')}</span>
          </div>
          {CONCEPT_CATEGORIES.map((cat, ci) => {
            const items = conceptsByCategory(cat.id);
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
                    <h2>{t(`cat.${cat.id}.name`)}</h2>
                    <span className="cat-en">{cat.label} · {t(`cat.${cat.id}.blurb`)}</span>
                  </div>
                </motion.div>
                <div className="card-grid">
                  {items.map((concept, i) => {
                    const cm = concept.meta;
                    const cname = lang === 'en' && cm.en ? cm.en.name : cm.name;
                    const cblurb = lang === 'en' && cm.en ? cm.en.blurb : cm.blurb;
                    return (
                      <motion.button
                        key={cm.id}
                        className={`algo-card concept-card accent-${cm.accent}`}
                        onClick={() => navigate(`/concept/${cm.id}`)}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.12 + i * 0.05, type: 'spring', stiffness: 260, damping: 22 }}
                        whileHover={{ y: -6, scale: 1.025 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="card-glyph">{cm.glyph}</div>
                        <div className="card-body">
                          <div className="card-name">{cname}</div>
                          <div className="card-hook">{cblurb}</div>
                        </div>
                        <div className="card-foot">
                          <span className="chip chip-time">{t('concept.tag')}</span>
                        </div>
                        <span className="card-arrow">→</span>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <footer className="home-foot">
        <span>{t('home.footer')}</span>
      </footer>

      {/* Language settings modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{t('lang.title')}</h3>
              <div className="modal-actions">
                <button
                  className={lang === 'ko' ? 'btn-solid' : 'btn-ghost'}
                  onClick={() => { setLang('ko'); setSettingsOpen(false); }}
                >
                  {t('lang.ko')}
                </button>
                <button
                  className={lang === 'en' ? 'btn-solid' : 'btn-ghost'}
                  onClick={() => { setLang('en'); setSettingsOpen(false); }}
                >
                  {t('lang.en')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

import type { CodeLine } from '../core/types';

interface Props {
  code: CodeLine[];
  activeLine: number;
  compact?: boolean;
}

export default function CodePanel({ code, activeLine, compact }: Props) {
  return (
    <div className={`code-panel ${compact ? 'compact' : ''}`}>
      <div className="code-chrome">
        <span className="dot dot-r" />
        <span className="dot dot-y" />
        <span className="dot dot-g" />
        <span className="code-title">algorithm.py</span>
      </div>
      <pre className="code-body">
        {code.map((ln, i) => {
          const active = i === activeLine;
          return (
            <div key={i} className={`code-line ${active ? 'active' : ''}`}>
              {active && <span className="line-glow" />}
              <span className="ln-num">{i + 1}</span>
              <span className="ln-text" style={{ paddingLeft: ln.indent * 16 }}>
                {ln.text}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

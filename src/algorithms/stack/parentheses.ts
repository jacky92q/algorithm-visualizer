import type { Algorithm, BaseStep, RenderCtx, Renderer } from '../../core/types';
import { roundRect, text } from '../../core/draw';
import { easeOutBack, easeOutCubic, lerp, clamp } from '../../core/easing';
import { rgba } from '../../core/palette';

interface Block {
  ch: string;
  id: number;
}
interface StackStep extends BaseStep {
  input: string;
  pos: number;
  stack: Block[];
  popped?: Block; // block removed this step (for fly-out)
  status: 'run' | 'valid' | 'invalid';
}

const source = [
  { text: 'def is_valid(s):', indent: 0 },
  { text: 'stack = []', indent: 1 },
  { text: "pairs = {')':'(', ']':'[', '}':'{'}", indent: 1 },
  { text: 'for ch in s:', indent: 1 },
  { text: 'if ch in "([{":', indent: 2 },
  { text: 'stack.append(ch)', indent: 3 },
  { text: 'elif not stack or stack.pop() != pairs[ch]:', indent: 2 },
  { text: 'return False', indent: 3 },
  { text: 'return len(stack) == 0', indent: 1 },
];

const OPEN = '([{';
const PAIR: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

class StackRenderer implements Renderer<StackStep> {
  draw(rc: RenderCtx, prev: StackStep | null, curr: StackStep): void {
    const { ctx, width, height, time, t } = rc;
    const e = easeOutCubic(t);

    // ---- input ribbon ----
    const chars = curr.input.split('');
    const chW = clamp(width / Math.max(chars.length, 8), 30, 56);
    const totalW = chars.length * chW;
    const ribX = (width - totalW) / 2;
    const ribY = 64;
    text(ctx, 'INPUT', width / 2, ribY - 34, {
      size: 12,
      weight: 700,
      color: '#9A8B70',
      letterSpacing: 3,
    });
    chars.forEach((ch, i) => {
      const x = ribX + i * chW;
      const isCur = i === curr.pos;
      const consumed = i < curr.pos;
      const open = OPEN.includes(ch);
      ctx.save();
      if (isCur) {
        const pop = easeOutBack(clamp(t, 0, 1));
        ctx.shadowColor = rgba(open ? '#2A9D8F' : '#E07856', 0.6);
        ctx.shadowBlur = 18;
        roundRect(ctx, x + 4, ribY - 8 - pop * 4, chW - 8, 44 + pop * 8, 12);
        ctx.fillStyle = open ? '#D6F0EA' : '#F8DCD0';
        ctx.fill();
      } else {
        roundRect(ctx, x + 5, ribY - 4, chW - 10, 40, 10);
        ctx.fillStyle = consumed ? '#EEE6D6' : '#F6EEDD';
        ctx.fill();
      }
      ctx.restore();
      text(ctx, ch, x + chW / 2, ribY + 16, {
        size: clamp(chW * 0.5, 18, 28),
        weight: 800,
        color: consumed && !isCur ? '#C3B391' : isCur ? (open ? '#1E7A6F' : '#C85A3A') : '#4A3528',
      });
    });

    // ---- stack tower ----
    const baseY = height - 70;
    const blockH = 46;
    const blockW = 88;
    const cx = width / 2;
    const slotY = (level: number) => baseY - level * (blockH + 8) - blockH;

    // platform
    ctx.save();
    ctx.fillStyle = rgba('#6F4E37', 0.16);
    roundRect(ctx, cx - blockW / 2 - 18, baseY + 4, blockW + 36, 12, 6);
    ctx.fill();
    ctx.restore();
    text(ctx, 'STACK', cx, baseY + 34, { size: 12, weight: 700, color: '#9A8B70', letterSpacing: 3 });

    const prevHas = (id: number) => (prev ? prev.stack.some((b) => b.id === id) : false);
    const prevLevel = (id: number) => (prev ? prev.stack.findIndex((b) => b.id === id) : -1);

    // fly-out popped block
    if (curr.popped) {
      const fromLevel = prev ? prev.stack.length - 1 : 0;
      const y = lerp(slotY(fromLevel), slotY(fromLevel) - 90, e);
      const alpha = 1 - e;
      this.block(ctx, cx, y, blockW, blockH, curr.popped.ch, '#E07856', alpha, time, true);
    }

    curr.stack.forEach((b, level) => {
      const targetY = slotY(level);
      let y = targetY;
      let scale = 1;
      let alpha = 1;
      if (!prevHas(b.id)) {
        // entering: drop from above with a bounce
        const pe = easeOutBack(clamp(t, 0, 1));
        y = lerp(slotY(level) - 80, targetY, pe);
        scale = lerp(0.8, 1, clamp(t * 1.4, 0, 1));
      } else {
        const pl = prevLevel(b.id);
        if (pl !== level) y = lerp(slotY(pl), targetY, e);
      }
      const isTop = level === curr.stack.length - 1;
      const open = OPEN.includes(b.ch);
      this.block(
        ctx,
        cx,
        y,
        blockW * scale,
        blockH * scale,
        b.ch,
        open ? '#2A9D8F' : '#A8835E',
        alpha,
        time,
        isTop,
      );
    });

    if (curr.stack.length === 0 && !curr.popped) {
      text(ctx, 'empty', cx, baseY - 26, { size: 15, weight: 600, color: '#C3B391' });
    }

    // ---- verdict ----
    if (curr.status !== 'run') {
      const good = curr.status === 'valid';
      const label = good ? 'VALID  ✓' : 'INVALID  ✕';
      const col = good ? '#2A9D8F' : '#E07856';
      const pop = easeOutBack(clamp(t, 0, 1));
      ctx.save();
      ctx.globalAlpha = clamp(t * 1.5, 0, 1);
      ctx.shadowColor = rgba(col, 0.5);
      ctx.shadowBlur = 24;
      const bw = 200;
      roundRect(ctx, cx - bw / 2, height / 2 - 26, bw, 52 + pop * 4, 16);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
      text(ctx, label, cx, height / 2, { size: 22, weight: 800, color: '#FFF7EA' });
    }
  }

  private block(
    ctx: CanvasRenderingContext2D,
    cx: number,
    y: number,
    w: number,
    h: number,
    ch: string,
    color: string,
    alpha: number,
    time: number,
    glow: boolean,
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    if (glow) {
      const pulse = 0.6 + 0.4 * Math.sin(time * 4);
      ctx.shadowColor = rgba(color, 0.55);
      ctx.shadowBlur = 18 * pulse;
    } else {
      ctx.shadowColor = 'rgba(74,53,40,0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
    }
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, rgba(color, 0.82));
    roundRect(ctx, cx - w / 2, y, w, h, 12);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = alpha * 0.2;
    roundRect(ctx, cx - w / 2 + 5, y + 4, w - 10, h * 0.36, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
    text(ctx, ch, cx, y + h / 2, { size: 24, weight: 800, color: '#FFF7EA', alpha });
  }
}

export const parentheses: Algorithm<StackStep> = {
  meta: {
    id: 'valid-parentheses',
    category: 'stack',
    name: 'Valid Parentheses',
    tagline: 'Match every bracket with a stack',
    hook: '여는 괄호는 쌓고, 닫는 괄호는 맞춰 빼냅니다',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(n)',
    accent: 'teal',
    glyph: '🧩',
    summary:
      '스택의 LIFO 성질로 가장 최근에 열린 괄호를 추적합니다. 여는 괄호는 push, 닫는 괄호가 오면 stack을 pop 해 짝이 맞는지 확인하고, 끝까지 비면 올바른 괄호열입니다.',
    keyPoints: [
      '여는 괄호 ( [ { → 스택에 push',
      '닫는 괄호 → pop 후 짝 검사',
      '중간에 짝이 틀리거나 마지막에 남으면 INVALID',
    ],
    steps: [
      '문자를 왼쪽부터 하나씩 읽습니다.',
      '여는 괄호면 스택에 쌓습니다.',
      '닫는 괄호면 스택 맨 위와 짝이 맞는지 확인합니다.',
      '끝났을 때 스택이 비어 있으면 VALID 입니다.',
    ],
    defaultInput: '{[()()]}[]',
    inputHint: '괄호 문자만: ( ) [ ] { }',
    en: {
      name: 'Valid Parentheses',
      tagline: 'Stack-based bracket matching in O(n)',
      hook: 'Uses a stack to match opening and closing brackets',
      summary: 'Pushes opening brackets onto a stack and pops when a matching closer is found. If the stack is empty at the end, all brackets are balanced.',
      keyPoints: [
        'Push openers onto the stack; pop on matching closer',
        'Mismatch or leftover items mean invalid input',
        'Single linear pass — O(n) time, O(n) space',
      ],
      steps: [
        'Read each character from left to right.',
        'If it\'s an opener, push it onto the stack.',
        'If it\'s a closer, check the top of the stack for a match.',
        'At the end, the stack must be empty for valid input.',
      ],
      defaultInput: '{[()()]}[]',
      inputHint: 'Bracket characters only: ( ) [ ] { }',
    },
  },
  sourceCode: source,
  generate(input) {
    const s = (input.replace(/[^()[\]{}]/g, '') || '{[()()]}[]').slice(0, 16);
    const out: StackStep[] = [];
    const stack: Block[] = [];
    let nid = 0;
    const snap = (e: Partial<StackStep>): StackStep => ({
      line: 0,
      caption: '',
      input: s,
      pos: -1,
      stack: stack.map((b) => ({ ...b })),
      status: 'run',
      ...e,
    });

    out.push(snap({ line: 1, caption: '빈 스택으로 시작합니다.', action: 'INIT', tone: 'neutral' }));

    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      out.push(snap({ line: 3, pos: i, caption: `'${ch}' 문자를 읽습니다.`, action: 'READ', tone: 'active' }));
      if (OPEN.includes(ch)) {
        stack.push({ ch, id: nid++ });
        out.push(snap({ line: 5, pos: i, caption: `여는 괄호 '${ch}' → push`, action: 'PUSH', tone: 'compare' }));
      } else {
        if (stack.length === 0) {
          out.push(
            snap({
              line: 7,
              pos: i,
              caption: `'${ch}' 인데 스택이 비어 짝이 없음`,
              action: 'INVALID',
              tone: 'bad',
              status: 'invalid',
            }),
          );
          return out;
        }
        const top = stack[stack.length - 1];
        if (top.ch !== PAIR[ch]) {
          out.push(
            snap({
              line: 7,
              pos: i,
              caption: `'${ch}' 의 짝 '${PAIR[ch]}' 와 스택 top '${top.ch}' 불일치`,
              action: 'MISMATCH',
              tone: 'bad',
              status: 'invalid',
            }),
          );
          return out;
        }
        const popped = stack.pop()!;
        out.push(
          snap({
            line: 6,
            pos: i,
            popped,
            caption: `'${ch}' ↔ '${popped.ch}' 짝 일치 → pop`,
            action: 'POP',
            tone: 'good',
          }),
        );
      }
    }
    const valid = stack.length === 0;
    out.push(
      snap({
        line: 8,
        caption: valid ? '스택이 비었습니다 — 올바른 괄호열!' : '스택에 괄호가 남았습니다 — 오류!',
        action: valid ? 'VALID' : 'INVALID',
        tone: valid ? 'good' : 'bad',
        status: valid ? 'valid' : 'invalid',
      }),
    );
    return out;
  },
  createRenderer: () => new StackRenderer(),
};

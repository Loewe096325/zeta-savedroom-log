javascript:(() => {
  'use strict';
  const KEY = '__zetaScopedCollectorV34';
  if (window[KEY]) {
    window[KEY].show();
    return;
  }
  if (!/^https?:$/.test(location.protocol) || !/(^|\.)zeta-ai\.io$/i.test(location.hostname)) {
    alert('Zetaの会話を表示しているタブで実行してください。保存済みHTMLには実行しません。');
    return;
  }
  if (!document.body) {
    alert('ページの表示後に、もう一度実行してください。');
    return;
  }
  if (
    [
      '__zetaScopedCollectorV33',
      '__zetaSavedCollectorV32',
      '__zetaSavedCollectorV3',
      '__zetaSavedCollectorV2',
      '__zetaSavedCollector'
    ].some(k => window[k])
  ) {
    alert(
      '旧版が起動中です。必要なログを保存してから、このZetaタブを再読み込みし、新版を実行してください。旧データの引き継ぎはしません。'
    );
    return;
  }
  const CSS =
    ' *{box-sizing:border-box} html,body{margin:0;min-height:100%;background:#171717;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic UI","Yu Gothic","Hiragino Kaku Gothic ProN",Meiryo,sans-serif} body{padding:14px} main{width:100%;max-width:900px;margin:0 auto} .header{margin:0 0 21px} .logo{font-size:19px;line-height:24px;font-weight:800;letter-spacing:-1px;color:#fff;margin:0 0 9px} .divider{height:1px;background:#414141;width:100%} .meta{padding-top:13px;color:#8f99a5;font-size:12px;line-height:1.4} .chat{width:100%} .entry{width:100%} .narrator-entry{display:flex;justify-content:center;margin:21px 0 17px} .narrator{width:auto;max-width:390px;min-width:250px;background:#242426;border-radius:12px;padding:15px 20px;color:#bbc2cd;font-size:14px;font-style:italic;line-height:1.85;text-align:center;box-shadow:0 1px 0 rgba(255,255,255,.018) inset;word-break:break-word} .message-entry{display:flex;width:100%;margin:14px 0 20px} .left-entry{justify-content:flex-start} .right-entry{justify-content:flex-end} .message-wrap{display:flex;flex-direction:column;max-width:80%} .left-wrap{align-items:flex-start;width:fit-content;max-width:min(80%,660px)} .right-wrap{align-items:flex-end} .speaker{font-size:12px;line-height:16px;color:#a8b0bb;margin-bottom:5px;font-weight:400} .left-name{text-align:left} .right-name{text-align:right} .bubble{font-size:16px;line-height:1.55;color:#fafafa;padding:15px 16px;word-break:break-word} .left-bubble{width:fit-content;max-width:100%;background:#2b2b2d;border-radius:13px 13px 13px 3px;font-weight:600} .right-bubble{width:max-content;max-width:100%;background:#493675;border-radius:13px 13px 3px 13px;font-weight:500} .footer{margin:26px 0 8px;text-align:right;color:#555;font-size:10px} @media(max-width:600px){ body{padding:11px} .message-wrap{max-width:88%} .left-wrap{width:fit-content;max-width:88%} .bubble{font-size:15px;padding:13px 14px} .narrator{max-width:72%;min-width:0;font-size:13px;padding:13px 16px} .narrator-entry{margin:18px 0 15px} }  .unknown-entry{justify-content:center}.unknown-wrap{align-items:flex-start;width:fit-content;max-width:85%}.unknown-name{color:#d8bb83}.unknown-bubble{width:fit-content;max-width:100%;outline:1px dashed #a98b57;background:#292629;border-radius:10px;font-weight:400}.warning{font-size:12px;color:#d8bb83;line-height:1.6;margin-bottom:16px} ';
  const component = n => '[data-sentry-component="' + n + '"],[data-sentry-element="' + n + '"]';
  const LIST = component('ChatMessageList') + ',[role="log"]';
  const MSG = component('ChatMessage') + ',[data-message-id],[id^="message-"]';
  const LEFT = component('LeftContentView'),
    RIGHT = component('RightContentView');
  const NARRATOR = component('NarratorBubble') + ',' + component('NarratorContentView');
  const BUBBLE = component('ChatBubbleContainer') + ',' + component('NarratorBubble');
  const BODY = '.chat,' + BUBBLE;
  const q = (s, r) => Array.from(r.querySelectorAll(s));
  const esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const locationKey = () => location.href;
  const S = {
    root: null,
    anchor: null,
    route: '',
    stamp: '',
    items: new Map(),
    edges: new Map(),
    next: 0,
    running: false,
    selecting: false,
    reason: 'NOT_SELECTED',
    seen: 0,
    left: '',
    right: '',
    auto: true,
    overrides: new Map(),
    reviewPage: 0
  };
  const ui = {};
  let timer,
    ids = new WeakMap(),
    nextId = 0,
    selectRoute = '';
  const host = document.createElement('div');
  host.id = '__zeta_scoped_collector_v34';
  host.style.cssText =
    'position:fixed;right:14px;bottom:14px;z-index:2147483647;width:350px;max-width:calc(100vw - 28px);';
  const shadow = host.attachShadow({ mode: 'open' });
  const localStyle = document.createElement('style');
  localStyle.textContent =
    ':host{color-scheme:dark}*{box-sizing:border-box}.panel{background:#19191d;color:#eee;border:1px solid #666;border-radius:12px;padding:12px;font:13px/1.5 sans-serif;max-height:82vh;overflow:auto;box-shadow:0 5px 22px #0007}h2{font:700 14px/1.4 sans-serif;margin:0 0 8px}.status{color:#ddd;white-space:pre-line;margin:6px 0}.muted{color:#aaa;font-size:11px}.row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}button{background:#303038;color:#fff;border:1px solid #666;border-radius:5px;padding:6px 9px;font:12px/1.4 sans-serif;cursor:pointer}button:disabled{opacity:.4;cursor:default}input[type=text]{display:block;width:100%;padding:6px;background:#25252c;color:#eee;border:1px solid #666;border-radius:4px;margin:3px 0 7px;font:13px/1.4 sans-serif}label{font-size:12px}summary{cursor:pointer}pre{font:12px/1.5 sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;background:#242429;padding:8px;border-radius:6px;margin:6px 0}select{width:100%;padding:6px;background:#25252c;color:#eee;border:1px solid #777;border-radius:4px;font:12px/1.4 sans-serif}.review-card{border-top:1px solid #555;padding:8px 0}.hidden{display:none!important}';
  shadow.append(localStyle);
  function el(tag, text, cls) {
    const x = document.createElement(tag);
    if (text !== undefined) x.textContent = text;
    if (cls) x.className = cls;
    return x;
  }
  function button(label, action) {
    const x = el('button', label);
    x.type = 'button';
    x.addEventListener('click', action);
    return x;
  }
  function status(text, reason) {
    ui.status.textContent = text;
    if (reason) S.reason = reason;
  }
  function inPanel(event) {
    return event.composedPath().includes(host);
  }
  function ancestor(node, selector) {
    for (let n = node; n && n !== S.root; n = n.parentElement) if (n.matches(selector)) return n;
    return null;
  }
  function contextStamp(root) {
    const values = [];
    for (let n = root; n && n !== document.body; n = n.parentElement) {
      for (const a of [
        'data-room-id',
        'data-saved-room-id',
        'data-conversation-id',
        'data-chat-id'
      ]) {
        if (n.hasAttribute(a)) values.push(a + '=' + n.getAttribute(a));
      }
    }
    return values.join('|');
  }
  function chooseRoot(target) {
    const marked = target.closest(LIST);
    if (marked && marked !== document.body && marked !== document.documentElement) return marked;
    for (let n = target.parentElement; n && n !== document.body; n = n.parentElement) {
      if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) return n;
    }
    return null;
  }
  function belongs(c, root) {
    if (!root.contains(c) || c === root) return false;
    const list = c.closest(LIST);
    return root.matches(LIST) ? list === root : !list || list.contains(root);
  }
  function bodies(root) {
    const out = q('.chat', root).filter(c => !c.querySelector('.chat'));
    for (const c of q(BUBBLE, root)) {
      if (!c.querySelector('.chat') && !c.querySelector(BUBBLE) && !out.includes(c)) out.push(c);
    }
    for (const c of q(component('NarratorContentView'), root)) {
      if (!c.querySelector(BODY) && !out.includes(c)) out.push(c);
    }
    return out
      .filter(c => belongs(c, root) && !c.closest('button,[role="button"],input,textarea,select'))
      .sort((a, b) => (a === b ? 0 : a.compareDocumentPosition(b) & 2 ? 1 : -1));
  }
  function visible(c) {
    if (!c.isConnected || !c.getClientRects().length) return false;
    const r = c.getBoundingClientRect();
    let left = Math.max(0, r.left),
      right = Math.min(innerWidth, r.right),
      top = Math.max(0, r.top),
      bottom = Math.min(innerHeight, r.bottom);
    if (right <= left || bottom <= top) return false;
    for (let n = c; n; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (
        n.hidden ||
        n.hasAttribute('inert') ||
        n.getAttribute('aria-hidden') === 'true' ||
        st.display === 'none' ||
        st.visibility === 'hidden' ||
        st.visibility === 'collapse' ||
        st.contentVisibility === 'hidden' ||
        Number(st.opacity) === 0
      )
        return false;
      if (n !== c) {
        const nr = n.getBoundingClientRect();
        if (/^(auto|scroll|hidden|clip)$/.test(st.overflowX)) {
          left = Math.max(left, nr.left);
          right = Math.min(right, nr.right);
        }
        if (/^(auto|scroll|hidden|clip)$/.test(st.overflowY)) {
          top = Math.max(top, nr.top);
          bottom = Math.min(bottom, nr.bottom);
        }
      }
      if (right <= left || bottom <= top) return false;
    }
    return true;
  }
  function ownValue(o, key) {
    if (!o || (typeof o !== 'object' && typeof o !== 'function')) return undefined;
    try {
      const d = Object.getOwnPropertyDescriptor(o, key);
      return d && 'value' in d ? d.value : undefined;
    } catch (e) {
      return undefined;
    }
  }
  function normalizeRole(value) {
    if (typeof value !== 'string') return '';
    const v = value.trim().toLowerCase().replace(/[ _-]/g, '');
    if (['narrator', 'narration'].includes(v)) return 'narrator';
    if (['left', 'assistant', 'character', 'ai', 'bot'].includes(v)) return 'left';
    if (['right', 'user', 'human', 'player'].includes(v)) return 'right';
    return '';
  }
  function localNodes(c) {
    const out = [];
    for (let n = c; n && n !== S.root && out.length < 14; n = n.parentElement) {
      out.push(n);
      if (n.matches(MSG)) break;
    }
    return out;
  }
  function componentRole(n) {
    for (const attr of ['data-sentry-component', 'data-sentry-element']) {
      const v = (n.getAttribute(attr) || '').toLowerCase();
      if (['narratorbubble', 'narratorcontentview'].includes(v)) return 'narrator';
      if (['leftcontentview', 'leftchatbubble', 'assistantmessage', 'charactermessage'].includes(v))
        return 'left';
      if (['rightcontentview', 'rightchatbubble', 'usermessage', 'playermessage'].includes(v))
        return 'right';
    }
    return '';
  }
  function roleAttributes(n) {
    for (const attr of [
      'data-position',
      'data-side',
      'data-message-role',
      'data-author-role',
      'data-sender-role',
      'data-role',
      'data-sender-type'
    ]) {
      const value = normalizeRole(n.getAttribute(attr));
      if (value) return value;
    }
    for (const attr of ['data-is-user', 'data-is-mine', 'data-is-own']) {
      const value = n.getAttribute(attr);
      if (value === 'true') return 'right';
      if (value === 'false') return 'left';
    }
    return '';
  }
  function metadataRole(props) {
    const content = ownValue(props, 'content');
    const position = normalizeRole(ownValue(content, 'position'));
    if (position) return position;
    for (const k of [
      'position',
      'side',
      'messageRole',
      'authorRole',
      'senderRole',
      'senderType',
      'role'
    ]) {
      const r = normalizeRole(ownValue(props, k));
      if (r) return r;
    }
    for (const k of ['isUser', 'isMine', 'isOwn']) {
      const v = ownValue(props, k);
      if (v === true) return 'right';
      if (v === false) return 'left';
    }
    return '';
  }
  function reactRole(n) {
    let keys;
    try {
      keys = Object.getOwnPropertyNames(n);
    } catch (e) {
      return '';
    }
    const propsKey = keys.find(k => k.startsWith('__reactProps$'));
    const direct = metadataRole(ownValue(n, propsKey));
    if (direct) return direct;
    const fiberKey = keys.find(k => k.startsWith('__reactFiber$'));
    let f = ownValue(n, fiberKey);
    for (let i = 0; f && i < 4; i++, f = ownValue(f, 'return')) {
      const hostNode = ownValue(f, 'stateNode');
      if (i && hostNode instanceof Element && hostNode !== n) break;
      const r = metadataRole(ownValue(f, 'memoizedProps'));
      if (r) return r;
    }
    return '';
  }
  function physicalSide(value, reversed) {
    value = (value || '').replace(/^(safe|unsafe)\s+/, '');
    if (value === 'left' || value === 'right') return value;
    if (['start', 'self-start', 'flex-start'].includes(value)) return reversed ? 'right' : 'left';
    if (['end', 'self-end', 'flex-end'].includes(value)) return reversed ? 'left' : 'right';
    return '';
  }
  function layoutRole(nodes) {
    const hits = new Set();
    let centeredItalic = false;
    for (const n of nodes) {
      const p = n.parentElement;
      if (!p || !S.root || !S.root.contains(p)) continue;
      const ns = getComputedStyle(n),
        ps = getComputedStyle(p);
      if (!ps.writingMode.startsWith('horizontal')) continue;
      const r = n.getBoundingClientRect(),
        pr = p.getBoundingClientRect();
      const left =
        r.left -
        pr.left -
        (parseFloat(ps.borderLeftWidth) || 0) -
        (parseFloat(ps.paddingLeft) || 0);
      const right =
        pr.right -
        r.right -
        (parseFloat(ps.borderRightWidth) || 0) -
        (parseFloat(ps.paddingRight) || 0);
      const free = left + right;
      if (r.width <= 0 || free < 20) continue;
      const rtl = ps.direction === 'rtl';
      let alignment = '',
        reversed = rtl;
      if (ps.display.includes('flex')) {
        const row = ps.flexDirection.startsWith('row');
        alignment = row
          ? ps.justifyContent
          : ns.alignSelf !== 'auto'
            ? ns.alignSelf
            : ps.alignItems;
        if (row && ps.flexDirection.endsWith('reverse')) reversed = !reversed;
      } else if (ps.display.includes('grid')) {
        alignment = ns.justifySelf !== 'auto' ? ns.justifySelf : ps.justifyItems;
      }
      let side = physicalSide(alignment, reversed);
      const classes = Array.from(n.classList);
      const ml = n.style.marginLeft === 'auto' || classes.includes('ml-auto');
      const mr = n.style.marginRight === 'auto' || classes.includes('mr-auto');
      if (ml && !mr) side = 'right';
      if (mr && !ml) side = 'left';
      const tolerance = Math.min(24, Math.max(5, pr.width * 0.025));
      if (side === 'left' && Math.abs(left) <= tolerance && right > tolerance + 10)
        hits.add('left');
      if (side === 'right' && Math.abs(right) <= tolerance && left > tolerance + 10)
        hits.add('right');
      if (
        alignment === 'center' &&
        Math.abs(left - right) < tolerance &&
        ns.textAlign === 'center'
      ) {
        const italic =
          ns.fontStyle === 'italic' ||
          (n === nodes[0] && getComputedStyle(nodes[0]).fontStyle === 'italic');
        if (italic) centeredItalic = true;
      }
    }
    if (hits.size === 1) return Array.from(hits)[0];
    if (!hits.size && centeredItalic) return 'narrator';
    return '';
  }
  function roleInfo(c) {
    const nodes = localNodes(c);
    for (const n of nodes) {
      const r = componentRole(n);
      if (r) return { role: r, source: 'component' };
    }
    for (const n of nodes) {
      const r = roleAttributes(n);
      if (r) return { role: r, source: 'attribute' };
    }
    for (const n of nodes) {
      const r = reactRole(n);
      if (r) return { role: r, source: 'metadata' };
    }
    const layout = layoutRole(nodes);
    return layout ? { role: layout, source: 'layout' } : { role: 'unknown', source: 'unknown' };
  }
  function roleOf(c) {
    return roleInfo(c).role;
  }
  function textOf(c) {
    if (c.matches('.chat'))
      return (c.innerText ?? c.textContent ?? '')
        .replace(/\r\n?/g, '\n')
        .replace(/\n[\t \u3000]*\n(?:[\t \u3000]*\n)*/g, '\n')
        .trim();
    const copy = c.cloneNode(true);
    q(
      'button,[role="button"],input,textarea,select,svg,img,script,style,[hidden],[aria-hidden="true"]',
      copy
    ).forEach(x => x.remove());
    for (const br of q('br', copy)) br.replaceWith(document.createTextNode('\n'));
    for (const p of q('p,div,li', copy)) p.appendChild(document.createTextNode('\n'));
    return (copy.textContent || '')
      .replace(/\r\n?/g, '\n')
      .replace(/\n[\t \u3000]*\n(?:[\t \u3000]*\n)*/g, '\n')
      .trim();
  }
  function cleanName(text) {
    const name = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    return name &&
      name.length <= 80 &&
      !/^(コピー|翻訳|編集|削除|再生成|続き|Copy|Edit|Delete|Translate|Retry)$/i.test(name)
      ? name
      : '';
  }
  function nameOf(c) {
    const wrap = ancestor(c, LEFT + ',' + RIGHT);
    if (wrap) {
      const copy = wrap.cloneNode(true);
      q(
        BODY +
          ',button,[role="button"],input,textarea,select,svg,img,time,script,style,[hidden],[aria-hidden="true"]',
        copy
      ).forEach(x => x.remove());
      const name = cleanName(copy.textContent);
      if (name) return name;
    }
    const labelSelector =
      '[data-sentry-component="SpeakerName"],[data-sentry-component="CharacterName"],[data-sentry-component="UserName"],[data-sentry-element="SpeakerName"],[data-speaker-name],.speaker-name,.character-name';
    for (const n of localNodes(c)) {
      if (n.matches(MSG)) break;
      const parent = n.parentElement;
      if (!parent || parent === S.root) break;
      const candidates = [];
      for (const sibling of Array.from(parent.children)) {
        if (
          sibling === n ||
          sibling.matches(BODY + ',button,[role="button"],svg,img,time,script,style') ||
          sibling.querySelector(BODY)
        )
          continue;
        if (
          !sibling.getClientRects().length ||
          sibling.hidden ||
          sibling.getAttribute('aria-hidden') === 'true'
        )
          continue;
        const st = getComputedStyle(sibling);
        if (st.display === 'none' || st.visibility === 'hidden') continue;
        const explicit = sibling.matches(labelSelector)
          ? sibling
          : sibling.querySelector(labelSelector);
        if (explicit) {
          const name = cleanName(
            explicit.getAttribute('data-speaker-name') || explicit.textContent
          );
          if (name) candidates.push(name);
        } else if (
          !sibling.querySelector('button,[role="button"],input,textarea,time') &&
          parseFloat(st.fontSize) <= 14
        ) {
          const name = cleanName(sibling.textContent);
          if (name) candidates.push(name);
        }
      }
      const names = Array.from(new Set(candidates));
      if (names.length === 1) return names[0];
      if (names.length > 1) return '';
    }
    return '';
  }
  function rowFor(c, all) {
    const m = ancestor(c, MSG),
      group = m || c;
    const mid =
      group.getAttribute('data-message-id') || (/^message-/.test(group.id) ? group.id : '');
    if (!ids.has(group)) ids.set(group, 'local-' + ++nextId);
    const own = m ? all.filter(x => ancestor(x, MSG) === m) : [c];
    const part = own.indexOf(c),
      key = (mid ? 'id:' + mid : ids.get(group)) + '::' + part;
    const old = S.items.get(key),
      info = roleInfo(c),
      role = info.role,
      speaker = role === 'left' || role === 'right' ? nameOf(c) : '';
    return applyOverride({
      key,
      text: textOf(c),
      role,
      roleSource: info.source,
      autoRole: role,
      autoSource: info.source,
      speaker: speaker || (old && old.speaker) || '',
      stable: !!mid,
      first: old ? old.first : 0,
      y: c.getBoundingClientRect().top,
      x: c.getBoundingClientRect().left
    });
  }
  function orderInfo(items = S.items, edges = S.edges) {
    const keys = Array.from(items.keys()),
      degree = new Map(keys.map(k => [k, 0]));
    for (const [a, set] of edges)
      if (degree.has(a)) for (const b of set) if (degree.has(b)) degree.set(b, degree.get(b) + 1);
    const sort = (a, b) => items.get(a).first - items.get(b).first;
    const queue = keys.filter(k => !degree.get(k)).sort(sort),
      result = [];
    let ambiguous = false;
    while (queue.length) {
      if (queue.length > 1) ambiguous = true;
      const a = queue.shift();
      result.push(a);
      for (const b of edges.get(a) || [])
        if (degree.has(b)) {
          degree.set(b, degree.get(b) - 1);
          if (!degree.get(b)) {
            queue.push(b);
            queue.sort(sort);
          }
        }
    }
    return { rows: result.map(k => items.get(k)), cycle: result.length !== keys.length, ambiguous };
  }
  function update() {
    const values = Array.from(S.items.values());
    const n = role => values.filter(x => x.role === role).length;
    ui.count.textContent = '累計 ' + values.length + ' 件 / 今回の表示 ' + S.seen + ' 件';
    ui.breakdown.textContent =
      '左 ' +
      n('left') +
      ' / 右 ' +
      n('right') +
      ' / 地の文 ' +
      n('narrator') +
      ' / 不明 ' +
      n('unknown');
    if (ui.review)
      ui.review.querySelector('summary').textContent =
        '話者を確認・修正（未判定 ' + n('unknown') + ' 件）';
    ui.run.textContent = S.running ? '一時停止' : '収集開始';
    ui.run.disabled = !S.root || S.selecting || !scopeValid();
    ui.save.disabled = !S.items.size;
    ui.copy.disabled = !S.items.size;
  }
  function scopeValid() {
    return (
      !!S.root &&
      S.root.isConnected &&
      locationKey() === S.route &&
      contextStamp(S.root) === S.stamp
    );
  }
  function scan() {
    if (!S.running) return 0;
    if (!scopeValid()) {
      S.running = false;
      status(
        '会話の移動・会話欄の置き換えを検出したため停止しました。前のログは保存できます。新しい会話は対象を選び直してください。',
        'SCOPE_CHANGED'
      );
      update();
      return 0;
    }
    const all = bodies(S.root),
      now = all.filter(visible);
    S.seen = now.length;
    if (!S.items.size && !now.includes(S.anchor)) {
      status(
        '選んだ返信が表示された位置で開始してください。別の発言へは自動で切り替えません。',
        'ANCHOR_NOT_VISIBLE'
      );
      update();
      return 0;
    }
    if (!now.length) {
      status(
        '選んだ会話欄に、現在読み取れる吹き出しがありません。ほかの会話欄は探しません。',
        'NO_VISIBLE_BODY'
      );
      update();
      return 0;
    }
    const current = now
      .map(c => rowFor(c, all))
      .filter(r => r.text)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const unique = new Map();
    for (const r of current) {
      const other = unique.get(r.key);
      if (other && (other.text !== r.text || other.role !== r.role)) {
        S.running = false;
        status(
          '同じ識別情報の異なる発言が見つかりました。混入防止のため停止しました。',
          'DUPLICATE_ID'
        );
        update();
        return 0;
      }
      unique.set(r.key, r);
    }
    const rows = Array.from(unique.values());
    if (S.items.size && rows.length && !rows.some(r => S.items.has(r.key))) {
      status(
        '前に取得した発言とのつながりが確認できません。少し戻して、取得済みの発言が重なるようにスクロールしてください。この表示はまだ追加していません。',
        'NO_OVERLAP'
      );
      update();
      return 0;
    }
    const proposed = new Map(S.items),
      edges = new Map(Array.from(S.edges, ([k, v]) => [k, new Set(v)]));
    let next = S.next;
    for (const r of rows) {
      if (!proposed.has(r.key)) r.first = next++;
      proposed.set(r.key, r);
    }
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1].key,
        b = rows[i].key;
      if (a === b) continue;
      if (!edges.has(a)) edges.set(a, new Set());
      edges.get(a).add(b);
    }
    if (orderInfo(proposed, edges).cycle) {
      S.running = false;
      status(
        '発言順に矛盾が出たため停止しました。今回の表示は追加せず、以前の収集内容を保持しています。',
        'ORDER_CONFLICT'
      );
      update();
      return 0;
    }
    S.items = proposed;
    S.edges = edges;
    S.next = next;
    const introOnly = rows.length && rows.every(r => r.role === 'narrator');
    status(
      introOnly
        ? '今回の表示は地の文だけです。左右の返信が見える位置までスクロールし、件数が増えるか確認してください。'
        : '選択した会話欄だけを収集中。左右の件数を確認してください。未判定は「話者を確認・修正」で指定できます。',
      'COLLECTING'
    );
    update();
    return rows.length;
  }
  function safeScan() {
    try {
      return scan();
    } catch (e) {
      S.running = false;
      status(
        '読み取りエラーで停止しました。収集済みデータは保持しています。「本文なし診断」を利用できます。',
        'ERROR'
      );
      update();
      return 0;
    }
  }
  function cancelPick() {
    S.selecting = false;
    document.removeEventListener('click', pick, true);
    document.removeEventListener('pointerdown', blockPointer, true);
    document.removeEventListener('keydown', onEscape, true);
    ui.pick.textContent = '対象を選ぶ';
    ui.panel.querySelector('.controls').classList.remove('hidden');
    ui.settings.classList.remove('hidden');
    update();
  }
  function onEscape(e) {
    if (e.key === 'Escape') {
      cancelPick();
      status('選択を中止しました。既存の収集内容は変更していません。', 'PICK_CANCELLED');
    }
  }
  function blockPointer(e) {
    if (!inPanel(e)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
  function beginPick() {
    if (S.selecting) {
      cancelPick();
      status('選択を中止しました。', 'PICK_CANCELLED');
      return;
    }
    S.running = false;
    S.selecting = true;
    selectRoute = locationKey();
    ui.pick.textContent = '選択を中止';
    ui.panel.querySelector('.controls').classList.add('hidden');
    ui.settings.classList.add('hidden');
    status(
      '保存したいトークの、イントロより後にある返信の本文を1回クリックしてください。ホイールでのスクロールはできます。',
      'PICKING'
    );
    update();
    document.addEventListener('click', pick, true);
    document.addEventListener('pointerdown', blockPointer, true);
    document.addEventListener('keydown', onEscape, true);
  }
  function pick(e) {
    if (inPanel(e)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!target) return;
    S.lastClicked = target;
    const root = chooseRoot(target);
    S.diagnosticRoot = root;
    if (locationKey() !== selectRoute) {
      cancelPick();
      status(
        '選択中に画面が変わりました。もう一度「対象を選ぶ」を押してください。',
        'PICK_ROUTE_CHANGED'
      );
      return;
    }
    if (!root) {
      cancelPick();
      status(
        'この返信の会話欄を特定できません。収集は開始していません。「本文なし診断」をコピーしてください。',
        'NO_SCOPE'
      );
      return;
    }
    const all = bodies(root),
      anchor = all.find(c => c === target || c.contains(target));
    if (!anchor || !visible(anchor) || !textOf(anchor)) {
      cancelPick();
      status(
        '選んだ返信の本文を、この版では特定できません。イントロへの代替取得はしていません。「本文なし診断」を利用してください。',
        'NO_BODY_SELECTED'
      );
      return;
    }
    if (
      S.items.size &&
      !confirm(
        '新しい選択は0件から収集します。現在のログは保存済みですか？ OKで以前の収集データを破棄します。'
      )
    ) {
      cancelPick();
      status('選び直しを中止しました。以前のデータを保持しています。', 'PICK_CANCELLED');
      return;
    }
    S.root = root;
    S.anchor = anchor;
    S.route = locationKey();
    S.stamp = contextStamp(root);
    S.items = new Map();
    S.edges = new Map();
    S.next = 0;
    S.seen = 0;
    ids = new WeakMap();
    nextId = 0;
    S.left = '';
    S.right = '';
    S.auto = true;
    S.overrides.clear();
    S.reviewPage = 0;
    if (ui.reviewList) ui.reviewList.replaceChildren();
    ui.left.value = '';
    ui.right.value = '';
    ui.auto.checked = true;
    ui.preview.textContent =
      textOf(anchor).slice(0, 160) + (textOf(anchor).length > 160 ? '…' : '');
    ui.previewWrap.classList.remove('hidden');
    cancelPick();
    status(
      'この返信が、保存したいトークのものか確認して「収集開始」を押してください。まだ収集していません。',
      'SELECTED'
    );
    update();
  }
  function toggle() {
    if (S.running) {
      S.running = false;
      status('一時停止中。収集済みのログは保存できます。', 'PAUSED');
      update();
      return;
    }
    if (!scopeValid()) {
      status('対象を選び直してください。', 'SCOPE_CHANGED');
      update();
      return;
    }
    S.running = true;
    safeScan();
    update();
  }
  function nameFor(r) {
    const custom = S.overrides.get(r.key);
    if (custom && custom.name) return custom.name;
    if (r.role === 'narrator') return 'Narrator';
    if (r.role === 'unknown') return '話者不明';
    if (S.auto && r.speaker) return r.speaker;
    return r.role === 'right' ? S.right || 'あなた' : S.left || 'キャラクター';
  }
  function warnings(info) {
    const out = [];
    if (info.ambiguous)
      out.push('一部の発言順が未確定です。前後の発言を重ねて読み取り直してください。');
    if (info.rows.some(r => !r.stable))
      out.push('識別IDのない発言を含むため、再描画時の重複・欠落に注意してください。');
    if (info.rows.some(r => r.role === 'unknown'))
      out.push('未判定の発言は中央の破線枠にしています。「話者を確認・修正」で指定できます。');
    if (info.rows.some(r => r.roleSource === 'layout'))
      out.push('配置から左右を推定した発言を含みます。画面の話者と一致するか確認してください。');
    return out;
  }
  function buildHTML() {
    const info = orderInfo(),
      notes = warnings(info);
    const rows = info.rows
      .map(r => {
        const text = esc(r.text).replace(/\n/g, '<br>');
        if (r.role === 'narrator')
          return '<div class="entry narrator-entry"><div class="narrator">' + text + '</div></div>';
        const side = r.role === 'unknown' ? 'unknown' : r.role === 'right' ? 'right' : 'left';
        return (
          '<div class="entry message-entry ' +
          side +
          '-entry"><div class="message-wrap ' +
          side +
          '-wrap"><div class="speaker ' +
          side +
          '-name">' +
          esc(nameFor(r)) +
          '</div><div class="bubble ' +
          side +
          '-bubble">' +
          text +
          '</div></div></div>'
        );
      })
      .join('');
    return (
      '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="generator" content="Zeta local scoped log v3.4"><meta http-equiv="Content-Security-Policy" content="default-src \'none\';style-src \'unsafe-inline\';base-uri \'none\';form-action \'none\'"><title>zeta</title><style>' +
      CSS +
      '</style></head><body><main><header class="header"><div class="logo">zeta</div><div class="divider"></div><div class="meta">書き出し日時: ' +
      esc(new Date().toLocaleString('ja-JP')) +
      ' / メッセージ数: ' +
      info.rows.length +
      '</div></header>' +
      (notes.length ? '<div class="warning">' + notes.map(esc).join('<br>') + '</div>' : '') +
      '<div class="chat">' +
      rows +
      '</div><div class="footer">選択した会話の、表示して収集した範囲のみ</div></main></body></html>'
    );
  }
  function plainText() {
    const info = orderInfo(),
      notes = warnings(info);
    return (
      (notes.length ? notes.join('\n') + '\n\n' : '') +
      info.rows.map(r => '[' + nameFor(r) + ']\n' + r.text).join('\n\n')
    );
  }
  function prepareExport() {
    if (S.running) safeScan();
    if (!S.items.size) {
      status('まだ0件です。返信を選んで収集を開始してください。');
      return false;
    }
    return true;
  }
  function save() {
    if (!prepareExport()) return;
    try {
      const url = URL.createObjectURL(new Blob([buildHTML()], { type: 'text/html;charset=utf-8' })),
        a = document.createElement('a');
      a.href = url;
      a.download = 'zeta_log_v3_4_' + new Date().toISOString().replace(/[:.]/g, '-') + '.html';
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      status('HTMLのダウンロードを開始しました。開いて内容をご確認ください。');
    } catch (e) {
      status('保存できませんでした。TXTコピーを利用してください。');
    }
  }
  async function clipboard(text, done) {
    try {
      await navigator.clipboard.writeText(text);
      status(done);
    } catch (e) {
      const area = el('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;inset:0 auto auto 0;width:2px;height:2px;';
      shadow.append(area);
      area.focus();
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e2) {}
      area.remove();
      if (ok) status(done);
      else {
        const box = el('textarea');
        box.value = text;
        box.readOnly = true;
        box.style.cssText = 'width:100%;height:120px';
        ui.panel.append(box);
        box.focus();
        box.select();
        status('自動コピーができませんでした。下の欄をCtrl+Cでコピーしてください。');
      }
    }
  }
  function diagnostic() {
    const root = S.diagnosticRoot || S.root,
      anchor = S.lastClicked || S.anchor;
    const lines = [
      'Zeta scoped collector v3.4 / structure only',
      'No message text, speaker names, URLs or IDs',
      'reason = ' + S.reason,
      'selected = ' + !!S.root,
      'scopeConnected = ' + !!(root && root.isConnected),
      'sameLocation = ' + (S.root ? locationKey() === S.route : 'not-selected'),
      'mode = ' + (/\/saved-rooms\//.test(location.pathname) ? 'saved-rooms' : 'other'),
      'collected = ' + S.items.size
    ];
    const values = Array.from(S.items.values());
    for (const role of ['left', 'right', 'narrator', 'unknown'])
      lines.push('role ' + role + ' = ' + values.filter(r => r.role === role).length);
    for (const source of ['component', 'attribute', 'metadata', 'layout', 'manual', 'unknown'])
      lines.push(
        'roleSource ' + source + ' = ' + values.filter(r => r.roleSource === source).length
      );
    if (root) {
      lines.push('scopeType = ' + (root.matches(LIST) ? 'marked-list' : 'scroll-container'));
      for (const name of [
        'ChatMessageList',
        'ChatMessage',
        'Candidate',
        'ChatBubbleContainer',
        'NarratorBubble',
        'NarratorContentView',
        'LeftContentView',
        'RightContentView',
        'grayRichTags'
      ])
        lines.push(name + ' = ' + q(component(name), root).length);
      lines.push(
        'all .chat = ' + q('.chat', root).length,
        'div.chat = ' + q('div.chat', root).length,
        'body candidates = ' + bodies(root).length,
        'visible candidates = ' + bodies(root).filter(visible).length
      );
    }
    if (anchor) {
      const allowed = new Set([
        'ChatMessageList',
        'ChatMessage',
        'Candidate',
        'ChatBubbleContainer',
        'NarratorBubble',
        'NarratorContentView',
        'LeftContentView',
        'RightContentView',
        'grayRichTags'
      ]);
      for (let n = anchor, i = 0; n && i < 10; n = n.parentElement, i++) {
        const c =
          n.getAttribute('data-sentry-component') || n.getAttribute('data-sentry-element') || '';
        lines.push(
          'ancestor ' +
            i +
            ': tag=' +
            n.tagName.toLowerCase() +
            ', component=' +
            (allowed.has(c) ? c : c ? 'other' : 'none') +
            ', chatClass=' +
            n.classList.contains('chat') +
            ', hasMessageId=' +
            n.hasAttribute('data-message-id') +
            ', display=' +
            getComputedStyle(n).display
        );
        if (n === root) break;
      }
    }
    return lines.join('\n');
  }
  function applyOverride(row) {
    const ov = S.overrides.get(row.key);
    if (ov && ov.role) {
      row.role = ov.role;
      row.roleSource = 'manual';
    }
    return row;
  }
  function roleLabel(role) {
    return (
      { left: 'キャラ・左', right: '自分・右', narrator: '地の文', unknown: '未判定' }[role] ||
      '未判定'
    );
  }
  function sourceLabel(source) {
    return (
      {
        component: '画面部品',
        attribute: '属性',
        metadata: '役割データ',
        layout: '配置から推定',
        manual: '手動',
        unknown: '手がかりなし'
      }[source] || source
    );
  }
  function renderReview() {
    if (!ui.reviewList) return;
    const rows = orderInfo().rows;
    const pageSize = 25;
    S.reviewPage = Math.max(
      0,
      Math.min(S.reviewPage || 0, Math.max(0, Math.ceil(rows.length / pageSize) - 1))
    );
    const start = S.reviewPage * pageSize;
    ui.reviewPage.textContent = rows.length
      ? start + 1 + '～' + Math.min(start + pageSize, rows.length) + ' / ' + rows.length + ' 件'
      : 'まだ0件です';
    ui.reviewList.replaceChildren();
    for (let i = start; i < Math.min(start + pageSize, rows.length); i++) {
      const row = rows[i],
        ov = S.overrides.get(row.key) || {};
      const card = el('div', undefined, 'review-card');
      card.append(
        el(
          'div',
          i + 1 + ' · ' + roleLabel(row.role) + '（' + sourceLabel(row.roleSource) + '）',
          'muted'
        )
      );
      card.append(el('pre', row.text.slice(0, 140) + (row.text.length > 140 ? '…' : '')));
      const select = el('select');
      for (const [value, label] of [
        ['', '自動：' + roleLabel(row.autoRole)],
        ['left', 'キャラ・左'],
        ['right', '自分・右'],
        ['narrator', '地の文'],
        ['unknown', '未判定のまま']
      ]) {
        const o = el('option', label);
        o.value = value;
        select.append(o);
      }
      select.value = ov.role || '';
      select.setAttribute('aria-label', '発言 ' + (i + 1) + ' の話者');
      select.onchange = () => {
        const current = S.overrides.get(row.key) || {};
        S.overrides.set(row.key, { ...current, role: select.value });
        const existing = S.items.get(row.key);
        if (existing) {
          existing.role = select.value || existing.autoRole || 'unknown';
          existing.roleSource = select.value ? 'manual' : existing.autoSource || 'unknown';
        }
        card.firstChild.textContent =
          i + 1 + ' · ' + roleLabel(existing.role) + '（' + sourceLabel(existing.roleSource) + '）';
        update();
      };
      const name = el('input');
      name.type = 'text';
      name.maxLength = 80;
      name.autocomplete = 'off';
      name.placeholder = 'この発言だけの名前（任意）';
      name.value = ov.name || '';
      name.setAttribute('aria-label', '発言 ' + (i + 1) + ' の名前');
      name.oninput = () => {
        S.overrides.set(row.key, { ...(S.overrides.get(row.key) || {}), name: name.value.trim() });
      };
      card.append(select, name);
      ui.reviewList.append(card);
    }
  }
  function setupReview() {
    const d = el('details');
    d.append(el('summary', '話者を確認・修正'));
    d.append(
      el(
        'div',
        '自動判定が違う発言は、ここで左右・地の文を選べます。入力はこのタブ内だけに保持されます。本文の変更はしません。',
        'muted'
      )
    );
    const tools = el('div', undefined, 'row');
    tools.append(
      button('一覧を更新', renderReview),
      button('前の25件', () => {
        S.reviewPage--;
        renderReview();
      }),
      button('次の25件', () => {
        S.reviewPage++;
        renderReview();
      })
    );
    ui.reviewPage = el('div', '', 'muted');
    ui.reviewList = el('div');
    d.append(tools, ui.reviewPage, ui.reviewList);
    d.ontoggle = () => {
      if (d.open) renderReview();
    };
    ui.review = d;
    ui.panel.append(d);
  }
  function close() {
    if (S.items.size && !confirm('終了すると未保存の収集内容は失われます。終了しますか？')) return;
    S.running = false;
    cancelPick();
    clearInterval(timer);
    host.remove();
    delete window[KEY];
  }
  ui.panel = el('div', undefined, 'panel');
  ui.panel.append(el('h2', 'Zeta ログ収集 v3.4（対象選択式）'));
  ui.count = el('div');
  ui.breakdown = el('div', '', 'muted');
  ui.status = el('div', '', 'status');
  ui.panel.append(ui.count, ui.breakdown, ui.status);
  ui.pick = button('対象を選ぶ', beginPick);
  ui.panel.append(ui.pick);
  ui.previewWrap = el('div', undefined, 'hidden');
  ui.previewWrap.append(el('div', '選んだ返信の確認（このブラウザ内のみ）', 'muted'));
  ui.preview = el('pre');
  ui.previewWrap.append(ui.preview);
  ui.panel.append(ui.previewWrap);
  ui.settings = el('details');
  ui.settings.append(el('summary', '名前の設定'));
  function nameInput(label, key) {
    const l = el('label', label),
      input = el('input');
    input.type = 'text';
    input.maxLength = 80;
    input.autocomplete = 'off';
    input.oninput = () => {
      S[key] = input.value.trim();
    };
    l.append(input);
    ui.settings.append(l);
    return input;
  }
  ui.left = nameInput('左側の名前（未取得時）', 'left');
  ui.right = nameInput('右側の名前（未取得時）', 'right');
  const autoLabel = el('label');
  ui.auto = el('input');
  ui.auto.type = 'checkbox';
  ui.auto.checked = true;
  ui.auto.onchange = () => {
    S.auto = ui.auto.checked;
  };
  autoLabel.append(ui.auto, document.createTextNode('発言ごとの名前を優先'));
  ui.settings.append(autoLabel);
  ui.panel.append(ui.settings);
  setupReview();
  const controls = el('div', undefined, 'row controls');
  ui.run = button('収集開始', toggle);
  ui.save = button('HTML保存', save);
  ui.copy = button('TXTコピー', () => {
    if (prepareExport()) clipboard(plainText(), '本文をコピーしました。');
  });
  controls.append(
    ui.run,
    ui.save,
    ui.copy,
    button('本文なし診断', () => clipboard(diagnostic(), '本文なしの診断結果をコピーしました。')),
    button('隠す', () => {
      host.style.display = 'none';
    }),
    button('終了', close)
  );
  ui.panel.append(
    controls,
    el(
      'div',
      '全履歴の自動取得ではありません。会話を遡って表示してください。再読み込み前に保存してください。旧版データは引き継ぎません。',
      'muted'
    )
  );
  shadow.append(ui.panel);
  document.body.append(host);
  function show() {
    host.style.display = '';
    update();
  }
  window[KEY] = {
    show,
    scan: safeScan,
    ordered: () => orderInfo().rows,
    buildHTML,
    plainText,
    diagnostic,
    review: () => {
      ui.review.open = true;
      renderReview();
    }
  };
  status(
    '「対象を選ぶ」を押し、保存したいトークの返信をクリックしてください。勝手に会話を選んで収集することはありません。',
    'NOT_SELECTED'
  );
  update();
  timer = setInterval(() => {
    if (S.running) safeScan();
  }, 600);
})();

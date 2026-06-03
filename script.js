/* ── NER RULES ── */
const RULES = [
  // PERSONS
  { pattern: /\bSundar\b/,      tag: 'B-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bPichai[,]?\b/,  tag: 'I-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bElon\b/,        tag: 'B-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bMusk\b/,        tag: 'I-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bGeneral\b/,     tag: 'B-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bDwight\b/,      tag: 'I-PERSON', type: 'Person',       cls: 't-person' },
  { pattern: /\bEisenhower\b/,  tag: 'I-PERSON', type: 'Person',       cls: 't-person' },
  // ORGS
  { pattern: /\bGoogle[,]?\b/,  tag: 'B-ORG',    type: 'Organization', cls: 't-org' },
  { pattern: /\bNASA\b/,        tag: 'B-ORG',    type: 'Organization', cls: 't-org' },
  { pattern: /\bJPL\b/,         tag: 'I-ORG',    type: 'Organization', cls: 't-org' },
  { pattern: /\bGoldman\b/,     tag: 'B-ORG',    type: 'Organization', cls: 't-org' },
  { pattern: /\bSachs\b/,       tag: 'I-ORG',    type: 'Organization', cls: 't-org' },
  // LOCATIONS
  { pattern: /\bCalifornia\b/,  tag: 'B-LOCATION', type: 'Location',   cls: 't-location' },
  { pattern: /\bNew\b/,         tag: 'B-LOCATION', type: 'Location',   cls: 't-location' },
  { pattern: /\bYork\b/,        tag: 'I-LOCATION', type: 'Location',   cls: 't-location' },
  { pattern: /\bLondon\b/,      tag: 'B-LOCATION', type: 'Location',   cls: 't-location' },
  { pattern: /\bNormandy\b/,    tag: 'B-LOCATION', type: 'Location',   cls: 't-location' },
  { pattern: /\bWall\b/,        tag: 'B-LOCATION', type: 'Location',   cls: 't-location' },
  // MONEY
  { pattern: /\$\d+[\w]*/,      tag: 'B-MONEY',  type: 'Money',       cls: 't-money' },
  { pattern: /\bbillion\b/,     tag: 'I-MONEY',  type: 'Money',       cls: 't-money' },
  // DATES
  { pattern: /\b20\d\d[.]?\b/,  tag: 'B-DATE',   type: 'Date',        cls: 't-date' },
  { pattern: /\bQ[1-4]\s+20\d\d\b/, tag: 'B-DATE', type: 'Date',     cls: 't-date' },
  { pattern: /\bJune\s+\d+,\s+\d{4}\b/, tag: 'B-DATE', type: 'Date', cls: 't-date' },
  { pattern: /\b1944\b/,        tag: 'B-DATE',   type: 'Date',        cls: 't-date' },
];

const EXAMPLES = {
  news:    'Sundar Pichai, CEO of Google, announced plans to invest $100 billion in AI infrastructure across California and New York by 2027.',
  science: 'NASA scientists at JPL confirmed that the Perseverance rover collected rock samples on Mars in January 2024.',
  finance: 'Goldman Sachs reported a $3.2 billion profit for Q3 2024, beating Wall Street expectations by a wide margin.',
  history: 'On June 6, 1944, General Dwight Eisenhower led Allied forces to Normandy in what became the largest amphibious invasion in history.',
};

function tokenize(text) {
  return text.match(/\S+/g) || [];
}

function classifyToken(tok) {
  for (const rule of RULES) {
    if (rule.pattern.test(tok)) {
      return { tag: rule.tag, type: rule.type, cls: rule.cls };
    }
  }
  return { tag: 'O', type: 'Other', cls: 't-o' };
}

function buildTokensHTML(tokens, interactive = true) {
  return tokens.map((tok, i) => {
    const { tag, type, cls } = classifyToken(tok);
    const onclick = interactive
      ? `onclick="inspect('${tok.replace(/'/g,"\\'")}','${tag}','${type}',${i})"` : '';
    return `<div class="token-wrap ${cls}">
      <span class="token-word" ${onclick}>${tok}</span>
      <span class="token-tag">${tag}</span>
    </div>`;
  }).join('');
}

function buildEntitiesHTML(tokens) {
  const entities = [];
  let i = 0;
  while (i < tokens.length) {
    const { tag, type, cls } = classifyToken(tokens[i]);
    if (tag.startsWith('B-')) {
      let phrase = tokens[i];
      let j = i + 1;
      while (j < tokens.length && classifyToken(tokens[j]).tag.startsWith('I-')) {
        phrase += ' ' + tokens[j]; j++;
      }
      entities.push({ phrase, type, cls });
      i = j;
    } else { i++; }
  }
  if (!entities.length) return '<p style="color:var(--text-muted);font-size:13px;">No entities detected yet.</p>';
  const chipCls = { 'Person': 'chip-person', 'Organization': 'chip-org', 'Location': 'chip-location', 'Date': 'chip-date', 'Money': 'chip-money' };
  return entities.map(e => `
    <div class="entity-chip ${chipCls[e.type] || ''}">
      <span>${e.phrase}</span>
      <span class="chip-type">${e.type}</span>
    </div>`).join('');
}

function runNER() {
  const text = document.getElementById('inputText').value;
  const tokens = tokenize(text);
  document.getElementById('tokensGrid').innerHTML = buildTokensHTML(tokens);
  document.getElementById('detectedEntities').innerHTML = buildEntitiesHTML(tokens);
  // reset inspector
  document.getElementById('inspectorPlaceholder').style.display = '';
  document.getElementById('inspectorContent').classList.remove('visible');
}

function inspect(tok, tag, type, pos) {
  const conf = tag === 'O' ? '—' : (Math.floor(Math.random() * 10) + 90) + '%';
  document.getElementById('iToken').textContent = tok;
  document.getElementById('iTag').textContent = tag;
  document.getElementById('iType').textContent = type;
  document.getElementById('iPos').textContent = 'Position ' + pos;
  document.getElementById('iConf').textContent = conf;
  document.getElementById('inspectorPlaceholder').style.display = 'none';
  document.getElementById('inspectorContent').classList.add('visible');
}

function loadExample(key, el) {
  document.querySelectorAll('.example-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('inputText').value = EXAMPLES[key] || '';
  runNER();
}

/* ── TABS ── */
function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = '';
  btn.classList.add('active');
}

/* ── BIO EXPLANATION ── */
const BIO_EXPLAIN = {
  'B-PER': '<strong>B-PER</strong> — Beginning of a Person entity. This token starts a new person name.',
  'I-PER': '<strong>I-PER</strong> — Inside a Person entity. This token continues the person name from the previous token.',
  'B-ORG': '<strong>B-ORG</strong> — Beginning of an Organization entity.',
  'I-ORG': '<strong>I-ORG</strong> — Inside an Organization entity.',
  'O':     '<strong>O</strong> — Outside any entity. This is a regular word with no named-entity label.',
};

function showBio(el) {
  const tag = el.dataset.tag;
  document.getElementById('bioExplanation').innerHTML = BIO_EXPLAIN[tag] || tag;
}

/* ── ANIMATION ── */
const animSentence = 'Barack Obama visited Paris and met leaders from Microsoft and the United Nations.';
const animTokens = tokenize(animSentence);
let animIdx = 0, animTimer = null;

function playAnimation() {
  clearInterval(animTimer);
  animIdx = 0;
  const el = document.getElementById('animatedSentence');
  el.innerHTML = '';
  animTimer = setInterval(() => {
    if (animIdx >= animTokens.length) { clearInterval(animTimer); return; }
    const tok = animTokens[animIdx];
    const { tag, cls } = classifyToken(tok);
    el.innerHTML += `<span class="token-wrap ${cls}" style="display:inline-flex;margin:0 3px 6px;">
      <span class="token-word">${tok}</span>
    </span> `;
    animIdx++;
  }, 220);
}

/* ── TRY IT ── */
function simulateNER() {
  const text = document.getElementById('nerInput').value;
  const tokens = tokenize(text);
  document.getElementById('nerOutput').innerHTML = buildTokensHTML(tokens, false);
}

/* ── QUIZ ── */
function quiz(correct, btn) {
  document.querySelectorAll('.quiz-btn').forEach(b => { b.classList.remove('correct', 'wrong'); });
  btn.classList.add(correct ? 'correct' : 'wrong');
  document.getElementById('quizResult').textContent = correct
    ? '✅ Correct! "Taylor Swift" is a PERSON entity (B-PER + I-PER).'
    : '❌ Try again — look for the human name in the sentence.';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', runNER);

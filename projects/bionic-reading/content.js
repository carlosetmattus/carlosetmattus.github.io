let activeElement = null;
let savedHTML = null;
let hoverTimeout = null;
let pinnedElement = null;
let pinnedHTML = null;

const PARAGRAPH_TAGS = new Set([
  'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'TD', 'TH', 'DT', 'DD', 'FIGCAPTION'
]);

const MIN_TEXT_LENGTH = 30;

// Focus mode overlay
const overlay = document.createElement('div');
overlay.id = 'bionic-overlay';
document.body.appendChild(overlay);

function updateFocus() {
  const hasFocus = activeElement || pinnedElement;
  overlay.classList.toggle('active', !!hasFocus);
}

function elevate(el) {
  el.classList.add('bionic-elevated');
}

function lower(el) {
  el.classList.remove('bionic-elevated');
}

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI',
  'TABLE', 'BLOCKQUOTE', 'FIGURE', 'FORM'
]);

function hasNoBlockChildren(node) {
  return !Array.from(node.children).some(child => BLOCK_TAGS.has(child.tagName));
}

function findParagraph(el) {
  let node = el;
  while (node && node !== document.body) {
    if (PARAGRAPH_TAGS.has(node.tagName)) {
      if (node.textContent.trim().length >= MIN_TEXT_LENGTH) return node;
    }
    if (['DIV', 'SPAN', 'SECTION', 'ARTICLE', 'ASIDE'].includes(node.tagName)) {
      if (node.textContent.trim().length >= MIN_TEXT_LENGTH && hasNoBlockChildren(node)) return node;
    }
    node = node.parentElement;
  }
  return null;
}

function boldLen(word) {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  return Math.round(len * 0.4);
}

function bionicWord(word) {
  const n = boldLen(word);
  if (n === 0) return word;
  return `<b class="bionic-b">${word.slice(0, n)}</b>${word.slice(n)}`;
}

function applyBionic(element) {
  const SKIP_OPEN = /^<(script|style|code|pre|kbd|samp|textarea)[\s>]/i;
  const SKIP_CLOSE = /^<\/(script|style|code|pre|kbd|samp|textarea)>/i;
  let skipDepth = 0;

  element.innerHTML = element.innerHTML.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
    if (tag) {
      if (SKIP_OPEN.test(tag)) skipDepth++;
      else if (SKIP_CLOSE.test(tag) && skipDepth > 0) skipDepth--;
      return tag;
    }
    if (text && skipDepth === 0) {
      return text.replace(/[a-zA-ZÀ-ɏ]+/g, bionicWord);
    }
    return match;
  });
}

function activate(el) {
  const para = findParagraph(el);
  if (!para) return;
  if (para === activeElement) return;
  if (para === pinnedElement) return;
  if (para.dataset.bionicActive) return;
  if (para.isContentEditable) return;

  deactivate();

  activeElement = para;
  savedHTML = para.innerHTML;
  para.dataset.bionicActive = '1';
  para.classList.add('bionic-highlight');
  elevate(para);
  applyBionic(para);
  updateFocus();
}

function deactivate() {
  if (!activeElement) return;
  activeElement.innerHTML = savedHTML;
  activeElement.classList.remove('bionic-highlight');
  lower(activeElement);
  delete activeElement.dataset.bionicActive;
  activeElement = null;
  savedHTML = null;
  updateFocus();
}

function pin(para) {
  if (pinnedElement === para) {
    pinnedElement.innerHTML = pinnedHTML;
    pinnedElement.classList.remove('bionic-pinned');
    lower(pinnedElement);
    delete pinnedElement.dataset.bionicPinned;
    pinnedElement = null;
    pinnedHTML = null;
    updateFocus();
    return;
  }

  if (pinnedElement) {
    pinnedElement.innerHTML = pinnedHTML;
    pinnedElement.classList.remove('bionic-pinned');
    lower(pinnedElement);
    delete pinnedElement.dataset.bionicPinned;
    pinnedElement = null;
    pinnedHTML = null;
  }

  if (activeElement === para) {
    pinnedElement = para;
    pinnedHTML = savedHTML;
    activeElement = null;
    savedHTML = null;
  } else {
    pinnedElement = para;
    pinnedHTML = para.innerHTML;
    applyBionic(para);
  }

  para.dataset.bionicPinned = '1';
  para.classList.remove('bionic-highlight');
  para.classList.add('bionic-pinned');
  elevate(para);
  updateFocus();
}

document.addEventListener('mouseover', (e) => {
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => activate(e.target), 80);
});

document.addEventListener('mouseout', (e) => {
  if (!activeElement) return;
  if (e.relatedTarget === null || !activeElement.contains(e.relatedTarget)) {
    clearTimeout(hoverTimeout);
    deactivate();
  }
});

document.addEventListener('click', (e) => {
  const para = findParagraph(e.target);
  if (!para) return;
  pin(para);
});

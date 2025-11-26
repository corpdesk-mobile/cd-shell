Excellent — I like this: a scientific, reversible, provable approach. Below I lay out a short test plan (hypotheses → experiments → interpretation rules) and give you the exact, copy-pasteable tools (JS & CSS) to run in the browser **right now**. Each test is reversible and leaves an obvious trace so we can prove cause → effect.

I also included the path to your console log file for reference: `file:///mnt/data/console-export-2025-11-24_4-43-24.log`

---

# Goal

Find the precise CSS rule / pseudo-element / DOM node that creates the **extra left-side arrow** in the collapsed menu and prove it is the source. Then present safe, reversible fixes.

# Short hypotheses (ranked)

1. A CSS pseudo-element (`::before`) on `.has-arrow`, `.cd-menu-link` or `.metismenu a` is rendering content on the left.
2. A font-icon pseudo-element (FontAwesome `.fa::before`) is showing on left because `.fa` or `.menu-arrow` markup is misplaced/duplicated or a node is inheriting `.fa` pseudo.
3. A script (metisMenu) is injecting a helper element or toggler that appears on left in collapsed state.
4. A stray `<i>` element (or text node) inserted into the DOM at that spot by menu-rendering logic.

We will test these in order. Tests are non-destructive and reversible.

---

# Test 1 — discover which elements show a `::before` with visible content

Run the snippet below in the page console. It will enumerate elements under `#cd-sidebar` that have a non-empty computed `::before` and `::after` and print the selector of the element and the pseudo content. This gives immediate proof whether a pseudo-element is the culprit.

```js
// Paste into Console
(() => {
  const area = document.querySelector('#cd-sidebar') || document.body;
  const nodes = Array.from(area.querySelectorAll('*'));
  const results = [];
  nodes.forEach(n => {
    try {
      const csBefore = getComputedStyle(n, '::before').getPropertyValue('content');
      const csAfter = getComputedStyle(n, '::after').getPropertyValue('content');
      if (csBefore && csBefore !== 'none' && csBefore !== '""') {
        results.push({ el: n, type: 'before', content: csBefore, outer: n.outerHTML.slice(0,200) });
      }
      if (csAfter && csAfter !== 'none' && csAfter !== '""') {
        results.push({ el: n, type: 'after', content: csAfter, outer: n.outerHTML.slice(0,200) });
      }
    } catch(e){}
  });
  console.group('[PSEUDO-DETECT] Pseudo elements found');
  if (results.length===0) console.log('none found');
  results.forEach(r => {
    console.log(`%c${r.type} %c${r.content}`, 'color:teal;font-weight:bold','color:maroon');
    console.log(r.el);
    console.log('outerHTML snippet:', r.outer);
  });
  console.groupEnd();
  return results;
})();
```

**Interpretation**

* If you see an element with `::before` whose content equals an arrow glyph (e.g. `""` or `">"` or `"\f105"` etc.), note the element and proceed to Test 2.
* If nothing found, skip to Test 4 (look for actual inserted nodes).

---

# Test 2 — find the CSS rule(s) responsible for that pseudo-element

If Test 1 produced suspect elements `el`, run this to find stylesheet rules that mention that selector or pseudo:

```js
// Paste into Console — replace `el` with the element reference returned in Test1 (or run for all)
(() => {
  const results = [];
  Array.from(document.styleSheets).forEach((ss, ssIndex) => {
    let rules;
    try { rules = ss.cssRules || ss.rules; } catch(e) { return; } // cross-origin sheet may throw
    if (!rules) return;
    Array.from(rules).forEach((r, i) => {
      try {
        const txt = r.cssText || '';
        if (txt.includes('::before') || txt.includes('.has-arrow') || txt.includes('has-arrow')) {
          results.push({ sheet: ss.href || `inline#${ssIndex}`, index:i, text: txt.slice(0,300) });
        }
      } catch(e){}
    });
  });
  console.group('[STYLERULES] Candidate rules that mention ::before / has-arrow');
  if(results.length===0) console.log('none found (probably inline style or script-created pseudo?)');
  results.forEach(r => {
    console.log('sheet:', r.sheet);
    console.log('rule idx:', r.index);
    console.log('snippet:', r.text);
  });
  console.groupEnd();
  return results;
})();
```

**Interpretation**

* If you find a rule from a specific stylesheet (e.g. `metismenu.css` or `bootstrap.css`) that sets `::before` content, that is the cause. Note `sheet` and `index`.

---

# Test 3 — temporary reversible experiment: hide left-side `::before` only and verify

If Test 1/2 point to a `::before` pseudo on `.has-arrow` (or otherwise), apply a toggleable test rule appended to `<head>` that hides ONLY `::before` visuals and records itself. This is reversible (remove the style tag to revert).

Paste this in console:

```js
// Add test rule (reversible) — will hide ::before for has-arrow and show a small log indicator
(() => {
  const id = 'cd-test-hide-left-arrow';
  // remove existing if present
  const existing = document.getElementById(id);
  if (existing) { existing.remove(); console.log('Removed existing test rule'); return; }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    /* Temporary test: hide left pseudo on has-arrow */
    .metismenu .has-arrow::before,
    .has-arrow::before,
    .cd-menu-link::before {
      content: none !important;
      display: none !important;
      width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);
  console.log('Test rule inserted (id='+id+'). Re-run to remove it.');
})();
```

After insertion: visually inspect the menu.
If the stray arrow disappears, that's strong proof that a `::before` was the cause.

Revert by running same snippet again (it removes itself on second run).

---

# Test 4 — search for stray `<i>` or text nodes in menu list items

If Test 1 found no pseudo content, maybe an element (like `<i>` or `>` text) is inserted. Run:

```js
// find elements with textContent that is just an arrow or a single char like '>'
(() => {
  const area = document.querySelector('#cd-sidebar') || document.body;
  const suspicious = [];
  area.querySelectorAll('*').forEach(el => {
    const txt = (el.childNodes && Array.from(el.childNodes).filter(n => n.nodeType===3).map(n=>n.textContent.trim()).join(' ')) || '';
    if (txt && (txt === '>' || txt === '<' || txt === '›' || txt === '›' || txt==='»' || txt==='›')) {
      suspicious.push({el, textNodes: txt, outer: el.outerHTML.slice(0,200)});
    }
    // check for <i> children that are not the right one
    const iChildren = Array.from(el.querySelectorAll('i, span')).filter(n => {
      const cls = n.className || '';
      return cls && /fa-|menu-arrow|arrow|chevron/i.test(cls);
    });
    if (iChildren.length>1) {
      suspicious.push({el, reason: 'multiple icon children', icons: iChildren.map(a=>a.outerHTML)});
    }
  });
  console.log('suspicious nodes', suspicious);
  return suspicious;
})();
```

**Interpretation**

* If you find an element with a text node `'>'`, that proves a DOM text insertion. Check the calling render function (MenuService.renderMenuHtml) for stray characters in template strings (e.g. extra `>` in generated HTML) and fix it.

---

# Test 5 — track which stylesheet rule wins for the pseudo (if any)

If Test 2 found a candidate rule, you can check the *effective* computed style for the pseudo and which rule wins via DevTools directly (Elements → select node → Styles panel → click `::before` in the Styles pane). For programmatic proof, the stylesheet + rule index from Test 2 plus computed style together prove cause.

---

# If `::before` is confirmed — corrective options (reversible)

Pick 1 of these (all reversible):

A — **Add a small targeted override** (lowest friction). Append a style like tested above but with only one selector targeted at the exact rule you found (use same or higher specificity). Example (reversible):

```css
/* temporary, targeted override */
.metismenu .has-arrow::before { content: none !important; display:none !important; }
```

B — **Change menu rendering to avoid `.has-arrow` being applied** to the element that should not have it. That is more correct long-term: fix `MenuService.renderMenuHtml()` to give the `has-arrow` only to the anchor that should show right-arrow (or to the right `<i>`).

C — **Whitelabel FontAwesome usage** — if the left glyph comes from `.fa::before` because an element inherited `.fa` class, find and remove that class from the left element.

I recommend **A then B**:

* A: fast experiment to prove fix.
* B: permanent fix in code: make `renderMenuHtml()` wrap the right arrow icon in its own `<span class="menu-arrow fa fa-chevron-right"></span>` and ensure `.has-arrow` is only present on the parent but not causing left pseudo via CSS.

---

# Very focused code fixes to try (safe & reversible)

1. **Quick test override** (inject via console; reversible by removing):

```js
// Add reversible override
const id='cd-temp-hide-left-arrow';
if(!document.getElementById(id)){
  const s=document.createElement('style');
  s.id=id;
  s.textContent = '.metismenu .has-arrow::before, .cd-menu-link::before { content: none !important; display:none !important; }';
  document.head.appendChild(s);
  console.log('override installed');
} else {
  document.getElementById(id).remove();
  console.log('override removed');
}
```

2. **If a DOM text node was found** — fix the `renderMenuHtml()` template to ensure there are no stray characters. Search for places adding `>` or similar. For example make sure this snippet:

```ts
${ hasChildren ? `<span class="cd-menu-toggle-icon fa fa-chevron-right"></span>` : "" }
```

is used and there are no stray characters outside the template strings.

---

# How we'll *prove* success

1. Pre-test: run Test 1 to log the pseudo or node causing arrow. Save the output (copy console).
2. Apply the reversible override (Test 3) — this should remove the arrow. Record that the same element now shows no `::before` in Test 1 output. That proves the source is a pseudo-element.
3. Replace the override with a minimal targeted permanent fix (either css change or template change). Re-run Test 1 to show the pseudo no longer present. Save logs.
4. If the cause is a DOM insertion, pre-test will capture the text node; remove/fix code in render and re-run to show the node is gone.

---

# Next actions (pick one)

1. You run **Test 1** (pseudo detector) and paste the console output here (or say “results found: X”). I’ll read and immediately tell you the exact rule to modify and produce a final permanent fix.
2. If you prefer, I can provide a **one-click script** that: logs Test 1 results, applies the reversible override, and prints whether the arrow disappeared — so you get proof in one run. (Say “one-click” and I’ll give it.)

---

# Extra: reference to your uploaded log

I saved your console export here for reference:
`file:///mnt/data/console-export-2025-11-24_4-43-24.log`

(Use it for correlating the diagnostic messages with the tests.)

---

Tell me which immediate step you want — run Test 1 and paste output, or run the one-click script that both detects and applies the reversible override. I’ll then produce the exact permanent change and the short changelist (file + line) to commit.

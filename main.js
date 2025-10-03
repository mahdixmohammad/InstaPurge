// IG DM unsender: visible-only processing to prevent runaway scrolling
// Works by: process only messages fully in view (bottom->top), then page-up a bit, repeat.

let del = true;          // set false to stop
let delReact = true;     // set false to skip reaction removal
const VIEW_TOP_BUFFER = 120;
const VIEW_BOTTOM_BUFFER = 100;
const PAGE_UP_FRACTION = 0.65;   // how much of the viewport to scroll per page-up
const SETTLE_TIMEOUT = 900;      // ms
const SETTLE_STILLFOR = 140;     // ms

const delay = (ms) => new Promise(r => setTimeout(r, ms));

function getContainer() {
  const c = document.getElementsByClassName(
    "x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1odjw0f x1n2onr6 xh8yej3 x16o0dkt"
  )[1];
  if (c?.style) c.style.overflowAnchor = "none"; // kill anchoring jumps
  return c;
}

function getMessages(container) {
  return container.querySelectorAll('[data-release-focus-from="CLICK"]');
}

// Stable settle: wait until scrollTop hasn't changed for a small window
async function waitForScrollSettle(container, timeoutMs = SETTLE_TIMEOUT, stillForMs = SETTLE_STILLFOR) {
  const start = performance.now();
  let last = container.scrollTop;
  let stableFor = 0;
  while (performance.now() - start < timeoutMs) {
    await new Promise(r => requestAnimationFrame(r));
    const cur = container.scrollTop;
    if (Math.abs(cur - last) < 1) {
      stableFor += 16;
      if (stableFor >= stillForMs) return true;
    } else {
      stableFor = 0;
      last = cur;
    }
  }
  return false;
}

function inWorkingBand(rect) {
  return rect.top >= VIEW_TOP_BUFFER && rect.bottom <= (window.innerHeight - VIEW_BOTTOM_BUFFER);
}

// Only consider messages fully visible in the working band
function visibleMessages(container) {
  const all = getMessages(container);
  const vis = [];
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const r = el.getBoundingClientRect();
    if (inWorkingBand(r)) vis.push({ el, bottom: r.bottom });
  }
  // bottom-most first
  vis.sort((a, b) => b.bottom - a.bottom);
  return vis.map(v => v.el);
}

async function safeClickAndSettle(container, node, waitMs = 90) {
  if (!node) return;
  const prev = container.scrollTop;
  node.click();
  await delay(waitMs);
  if (Math.abs(container.scrollTop - prev) > 4) {
    container.scrollTop = prev; // restore if IG yanked us
  }
  await waitForScrollSettle(container);
}

async function closeDialogIfOpen() {
  const dialogs = document.querySelectorAll('[role="dialog"]');
  if (dialogs.length) {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await delay(90);
  }
}

async function deleteReaction(msg) {
  if (!delReact) return;
  try {
    const reactionEls = msg.getElementsByClassName(
      "x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"
    );
    if (!reactionEls.length) return;
    const container = getContainer();
    await safeClickAndSettle(container, reactionEls[0], 70);

    let popup = document.getElementsByClassName(
      "x1ja2u2z x1afcbsf x1a2a7pz x6ikm8r x10wlt62 x71s49j x6s0dn4 x78zum5 xdt5ytf xl56j7k x1n2onr6"
    );
    if (popup.length) {
      const panel = popup[popup.length - 1];
      const spans = panel.querySelectorAll("span");
      for (const s of spans) {
        const t = s.textContent?.trim().toLowerCase();
        if (t && (t.includes("remove") || t.includes("unreact"))) { s.click(); break; }
      }
      await delay(80);
      await closeDialogIfOpen();
      await waitForScrollSettle(container);
    }
  } catch {}
}

async function actOnMessage(container, msg) {
  // Skip skeleton/unrendered placeholders
  if (msg.classList.length === 1) return false;

  // Hover AFTER confirming it's visible (we only process visible messages anyway)
  msg.dispatchEvent(new MouseEvent("mouseover", { view: window, bubbles: true, cancelable: true }));
  await waitForScrollSettle(container, 600, 80);

  const rows = msg.getElementsByClassName("x6s0dn4 x78zum5 xdt5ytf xl56j7k");
  if (!rows.length) {
    await deleteReaction(msg);
    return false;
  }
  const actionRow = rows[rows.length - 1];
  const title = actionRow.querySelector("title");
  const hasMore = title && title.textContent.toLowerCase().includes("more");

  if (!hasMore) {
    await deleteReaction(msg);
    return false;
  }

  // Open "More"
  await safeClickAndSettle(container, actionRow, 100);

  // Find "Unsend"
  const menus = document.getElementsByClassName(
    "html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 xjbqb8w x78zum5 x15mokao x1ga7v0g x16uus16 xbiv7yw x1uhb9sk x1plvlek xryxfnj x1iyjqo2 x2lwn1j xeuugli xdt5ytf xqjyukv x1cy8zhl x1oa3qoh x1nhvcw1"
  );
  const menu = menus[menus.length - 1];
  if (!menu) { await closeDialogIfOpen(); return false; }

  let unsend = null;
  for (const s of menu.querySelectorAll("span")) {
    if (s.textContent?.trim().toLowerCase() === "unsend") { unsend = s.closest("span") || s; break; }
  }
  if (!unsend) { await closeDialogIfOpen(); await deleteReaction(msg); return false; }

  await safeClickAndSettle(container, unsend, 100);

  // Confirm
  const confirm = document.getElementsByClassName(
    "xjbqb8w x1qhh985 x10w94by x14e42zd x1yvgwvq x13fuv20 x178xt8z x1ypdohk xvs91rp x1evy7pa xdj266r x14z9mp xat24cr x1lziwak x1wxaq2x x1iorvi4 xf159sx xjkvuk6 xmzvs34 x2b8uid x87ps6o xxymvpz xh8yej3 x52vrxo x4gyw5p xkmlbd1 x1xlr1w8"
  )[0];
  if (confirm) {
    await safeClickAndSettle(container, confirm, 110);
  } else {
    document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await waitForScrollSettle(container);
  }

  await closeDialogIfOpen();
  return true; // we acted on a message
}

async function pageUp(container) {
  const before = container.scrollTop;
  const delta = Math.max(120, Math.floor(window.innerHeight * PAGE_UP_FRACTION));
  container.scrollBy({ top: -delta, left: 0, behavior: "instant" });
  await waitForScrollSettle(container);
  return container.scrollTop !== before;
}

async function run() {
  const container = getContainer();
  if (!container) { console.warn("Container not found."); return; }

  // Start from bottom once; we do NOT auto-scroll to top at any time
  container.scrollTo({ top: container.scrollHeight, behavior: "instant" });
  await waitForScrollSettle(container);

  let idleCycles = 0;   // watchdog to prevent runaway paging
  while (del) {
    const vis = visibleMessages(container); // only what's on screen
    let didWork = false;

    for (const msg of vis) {
      // quick visibility recheck; if it slipped, skip
      const r = msg.getBoundingClientRect();
      if (!inWorkingBand(r)) continue;

      const acted = await actOnMessage(container, msg);
      if (acted) {
        didWork = true;
        idleCycles = 0;
        // after deleting one, let layout settle before next
        await waitForScrollSettle(container);
      }
    }

    if (!didWork) {
      idleCycles++;
      const moved = await pageUp(container); // bring fresh messages into view
      if (!moved || container.scrollTop <= 1) break; // reached top or can't move
      // If we page up repeatedly without acting, slow down and bail eventually
      if (idleCycles > 8) {
        console.warn("No actionable messages for several pages; stopping to avoid runaway scrolling.");
        break;
      }
    } else {
      // small nudge so new candidates appear but no racing
      container.scrollBy({ top: -24, left: 0, behavior: "instant" });
      await waitForScrollSettle(container);
    }
  }
  console.log("Done (or stopped).");
}

// Run
run();

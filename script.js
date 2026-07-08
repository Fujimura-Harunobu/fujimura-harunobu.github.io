// リロード時は常にページ先頭へ（#hash を消す）
window.addEventListener("load", () => {
  const nav = performance.getEntriesByType?.("navigation")?.[0];
  const isReload =
    (nav && nav.type === "reload") ||
    (performance.navigation && performance.navigation.type === 1); // 古いSafari対策

  if (isReload) {
    history.replaceState(null, "", location.pathname + location.search); // #xxx を消す
    window.scrollTo(0, 0);
  }
});


// document.addEventListener("DOMContentLoaded", () => {
//   /* PRESENTATIONS */
//   sortNewsByDateDesc();
//   renumberNews();
//   setupFilter("#news", "#newsList", renumberNews);

//   /* PUBLICATIONS */
//   sortPublicationsByDateDesc();     // ← ソート
//   renumberPublications();           // ← その後に番号
//   setupFilter("#publications", "#pubList", renumberPublications);

//   /* AWARDS */
//   renumberAwards();   // ← これを追加
// });


/*************************************************
 * 1. ハンバーガーメニュー
 *************************************************/
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});


/*************************************************
 * 2. 汎用フィルター（セクションごとに独立）
 *************************************************/
function setupFilter(sectionSelector, listSelector, onAfterFilter) {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const chips = section.querySelectorAll(".chip");
  const list = section.querySelector(listSelector);
  if (!list) return;

  const items = Array.from(list.querySelectorAll("li"));

  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      chips.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;

      items.forEach((li) => {
        const tagsStr = li.dataset.tags || "";
        const tags = tagsStr.split(/\s+/).filter(Boolean);

        const show = (filter === "all") || tags.includes(filter);
        li.style.display = show ? "" : "none";
      });

      if (typeof onAfterFilter === "function") onAfterFilter();
    });
  });
}


/*************************************************
 * 3. PRESENTATIONS: 日付降順ソート
 *************************************************/
function sortNewsByDateDesc() {
  const list = document.querySelector("#newsList");
  if (!list) return;

  const items = Array.from(list.querySelectorAll("li"));

  items.sort((a, b) => {
    const dateA = a.querySelector(".date")?.textContent.trim() || "";
    const dateB = b.querySelector(".date")?.textContent.trim() || "";

    const timeA = new Date(dateA.replace(/\./g, "-")).getTime();
    const timeB = new Date(dateB.replace(/\./g, "-")).getTime();

    return timeB - timeA;
  });

  items.forEach(item => list.appendChild(item));
}


/*************************************************
 * 4. PRESENTATIONS: 通し番号（表示中のみ）
 *************************************************/
function renumberNews() {
  const items = Array.from(document.querySelectorAll("#newsList li"))
    .filter(li => li.style.display !== "none");

  const total = items.length;

  items.forEach((li, index) => {
    const no = li.querySelector(".news-no");
    if (no) no.textContent = `No.${total - index}`;
  });
}


/*************************************************
 * 5. PUBLICATIONS: 年（または日付）降順ソート
 *************************************************/
function sortPublicationsByDateDesc() {
  const list = document.querySelector("#pubList");
  if (!list) return;

  const items = Array.from(list.querySelectorAll("li"));

  // 例: "2025.11.20" / "2025.9.15" を Date に変換する
  const toTime = (li) => {
    // pub-no の "No.1" が混ざらないように、date内の最初の span を読む
    const raw = li.querySelector(".date span")?.textContent.trim() || "";

    // "Under review" など数値日付でないものは NaN にして最後へ
    if (!/\d{4}\.\d{1,2}\.\d{1,2}/.test(raw)) return NaN;

    // "2025.11.20" -> "2025-11-20"
    const iso = raw.replace(/\./g, "-");
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : NaN;
  };

  items.sort((a, b) => {
    const ta = toTime(a);
    const tb = toTime(b);

    // 日付が取れないもの（NaN）は下へ
    if (!Number.isFinite(ta) && !Number.isFinite(tb)) return 0;
    if (!Number.isFinite(ta)) return 1;
    if (!Number.isFinite(tb)) return -1;

    // 降順
    return tb - ta;
  });

  items.forEach((item) => list.appendChild(item));
}



/*************************************************
 * 6. PUBLICATIONS: 通し番号（表示中のみ）
 *************************************************/
function renumberPublications() {
  const items = Array.from(document.querySelectorAll("#pubList li"))
    .filter(li => li.style.display !== "none");

  const total = items.length;

  items.forEach((li, index) => {
    const no = li.querySelector(".pub-no");
    if (no) no.textContent = `No.${total - index}`;
  });
}

/*************************************************
 *  7. AWARDS: 通し番号（表示中のみ）
 *************************************************/
function renumberAwards() {
  const items = Array.from(document.querySelectorAll("#awards .timeline li"));

  const total = items.length;

  items.forEach((li, index) => {
    const no = li.querySelector(".award-no");
    if (no) {
      no.textContent = `No.${total - index}`;
    }
  });
}

/*************************************************
 * 7. AWARDS: 通し番号（表示中のみ）
 *************************************************/
function sortAwardsByDateDesc() {
  const list = document.querySelector("#awards .timeline");
  if (!list) return;

  const items = Array.from(list.querySelectorAll("li"));

  // 例: "2025.11" / "2022.3" を Date に変換する
  const toTime = (li) => {
    // award-no の "No.xx" が混ざらないように、date内の最初の span を読む
    const raw = li.querySelector(".date span")?.textContent.trim() || "";

    // 数値日付でないものは NaN にして最後へ
    // 許容: "YYYY.M" または "YYYY.MM"
    if (!/^\d{4}\.\d{1,2}$/.test(raw)) return NaN;

    // "2025.11" -> "2025-11-01"
    const iso = raw.replace(".", "-") + "-01";
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : NaN;
  };

  items.sort((a, b) => {
    const ta = toTime(a);
    const tb = toTime(b);

    // 日付が取れないもの（NaN）は下へ
    if (!Number.isFinite(ta) && !Number.isFinite(tb)) return 0;
    if (!Number.isFinite(ta)) return 1;
    if (!Number.isFinite(tb)) return -1;

    // 降順
    return tb - ta;
  });

  items.forEach((item) => list.appendChild(item));
}



/*************************************************
 * 7. 初期化（DOMContentLoaded は1回だけ）
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  /* PRESENTATIONS */
  sortNewsByDateDesc();
  renumberNews();
  setupFilter("#news", "#newsList", renumberNews);

  /* PUBLICATIONS */
  sortPublicationsByDateDesc();
  renumberPublications();
  setupFilter("#publications", "#pubList", renumberPublications);

  /* AWARDS */
  sortAwardsByDateDesc();
  renumberAwards();
});


const page = location.pathname.split("/").pop() || "index.html";

if (page === "index.html" && navigator.language.toLowerCase().startsWith("en")) {
  location.replace("index-en.html");
}



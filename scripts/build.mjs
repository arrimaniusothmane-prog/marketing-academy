import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { module1 } from "./content/module-01.mjs";
import { module2 } from "./content/module-02.mjs";
import { module3 } from "./content/module-03.mjs";
import { module4 } from "./content/module-04.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODULES = [module1, module2, module3, module4];

const SITE = {
  name: "SDM13 ACADEMY",
  phone: "+212 706 868 909",
  whatsapp: "212706868909",
  year: "2026",
  tagline: "أكاديمية عربية للتعلم العملي"
};

const PDFS = {
  m1: "SDM13-Personal-Development.pdf",
  m2: "SDM13-Digital-Marketing.pdf",
  m3: "SDM13-Ecommerce.pdf",
  m4: "SDM13-Graphic-Design.pdf"
};

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function write(rel, content) {
  const file = path.join(ROOT, rel);
  ensureDir(file);
  fs.writeFileSync(file, content, "utf8");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function moduleUrl(mod, prefix = "") {
  return `${prefix}modules/module-${mod.code}.html`;
}

function lessonUrl(mod, lesson, prefix = "") {
  return `${prefix}lessons/module-${mod.code}/lesson-${pad(lesson.number)}.html`;
}

function pdfUrl(mod, prefix = "") {
  return `${prefix}public/pdfs/${PDFS[mod.id]}`;
}

function moduleIndex(modId) {
  return MODULES.findIndex((m) => m.id === modId);
}

function nextModule(mod) {
  const i = moduleIndex(mod.id);
  return MODULES[i + 1] || null;
}

function prevModule(mod) {
  const i = moduleIndex(mod.id);
  return i > 0 ? MODULES[i - 1] : null;
}

function icon(name, cls = "") {
  const paths = {
    arrow: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    arrowLeft: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>',
    signal: '<path d="M4 20v-4"/><path d="M10 20v-8"/><path d="M16 20V8"/><path d="M22 20V4"/>',
    pen: '<path d="m14.5 5.5 4 4"/><path d="M4 20l4.5-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20z"/>',
    spark: '<path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    device: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
    whatsapp: '<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.5-5A8.4 8.4 0 1 1 20.5 11.6z"/><path d="M8.6 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6a6 6 0 0 0 2.8 2.4c.3.1.4 0 .6-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .2 0 1.1-.6 1.6-.5.5-1.2.8-2 .8-1 0-2.4-.4-4.1-2a10 10 0 0 1-2.7-4.1c-.3-1.1 0-2.1.5-2.7z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
    list: '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}

/* --------------------------------------------------------------------------
   Page shell
   -------------------------------------------------------------------------- */
function brand(prefix, options = {}) {
  const href = prefix ? `${prefix}index.html` : "index.html";
  return `<a class="brand" href="${href}" aria-label="SDM13 ACADEMY — الصفحة الرئيسية">
  <span class="brand__glyph" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
  <span class="brand__text"><span class="brand__name">SDM13</span><span class="brand__tag">ACADEMY</span></span>
</a>`;
}

const NAV = [
  { key: "home", label: "الرئيسية", href: "index.html" },
  { key: "programs", label: "البرامج", href: "training.html" },
  { key: "search", label: "البحث", href: "search.html" },
  { key: "contact", label: "التواصل", href: "contact.html" }
];

function header(prefix, active) {
  const links = NAV.map((item) => `<li><a href="${prefix}${item.href}"${item.key === active ? ' aria-current="page"' : ""}>${item.label}</a></li>`).join("");
  const mobileLinks = NAV.map((item) => `<li><a href="${prefix}${item.href}"${item.key === active ? ' aria-current="page"' : ""}>${item.label}</a></li>`).join("");
  return `<header class="site-header">
  <div class="wrap site-header__bar">
    ${brand(prefix)}
    <nav aria-label="التنقل الرئيسي"><ul class="nav-links">${links}</ul></nav>
    <div class="header-tools">
      <button class="icon-btn" type="button" data-theme-toggle aria-label="التبديل إلى الوضع الداكن" aria-pressed="false">${icon("moon")}</button>
      <a class="btn btn--sm header-cta" href="${prefix}training.html">ابدأ التعلم</a>
      <button class="icon-btn nav-toggle" type="button" data-menu-open aria-label="فتح قائمة التنقل" aria-controls="mobile-menu" aria-expanded="false">${icon("menu")}</button>
    </div>
  </div>
</header>
<div id="mobile-menu" class="mobile-menu" hidden role="dialog" aria-modal="true" aria-label="قائمة التنقل">
  <div class="mobile-menu__top">
    ${brand(prefix)}
    <button class="mobile-menu__close" type="button" data-menu-close>إغلاق</button>
  </div>
  <ul class="mobile-menu__links">${mobileLinks}</ul>
  <div class="mobile-menu__foot">
    <button class="icon-btn" type="button" data-theme-toggle aria-label="التبديل إلى الوضع الداكن" aria-pressed="false">${icon("moon")}</button>
    <span>${SITE.tagline}</span>
  </div>
</div>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__grid">
      <div class="site-footer__about">
        ${brand(prefix)}
        <p>منصة تعليمية عربية تجمع أربعة مسارات عملية في تطوير الذات والتسويق الرقمي والتجارة الإلكترونية والتصميم الجرافيكي، مع دروس وتمارين وملفات PDF قابلة للتحميل.</p>
      </div>
      <div class="site-footer__col">
        <h2>المسارات</h2>
        <ul>${MODULES.map((m) => `<li><a href="${moduleUrl(m, prefix)}">${esc(m.title)}</a></li>`).join("")}</ul>
      </div>
      <div class="site-footer__col">
        <h2>المنصة</h2>
        <ul>
          <li><a href="${prefix}training.html">جميع البرامج</a></li>
          <li><a href="${prefix}search.html">البحث في الدروس</a></li>
          <li><a href="${prefix}contact.html">تواصل معنا</a></li>
          <li><a href="${prefix}public/pdfs/${PDFS.m1}">ملفات PDF</a></li>
        </ul>
      </div>
      <div class="site-footer__col">
        <h2>تواصل</h2>
        <ul>
          <li><a href="https://wa.me/${SITE.whatsapp}" rel="noopener" target="_blank">واتساب: ${SITE.phone}</a></li>
          <li>التقدم يُحفظ على جهازك</li>
          <li>بدون تسجيل أو حسابات</li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>© ${SITE.year} ${SITE.name}. جميع الحقوق محفوظة.</span>
      <span>صُمم لدعم التعلم العربي العملي · 49 درسًا · 4 مسارات</span>
    </div>
  </div>
</footer>`;
}

function pageShell({ prefix = "", title, description, active = "", body, bodyAttrs = "", extraHead = "" }) {
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — منصة تعلم عربية`;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#f7f8f2">
<link rel="icon" href="${prefix}assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${prefix}assets/css/style.css">
${extraHead}
</head>
<body ${bodyAttrs}>
<a class="skip" href="#main">تجاوز إلى المحتوى</a>
${header(prefix, active)}
<main id="main">
${body}
</main>
${footer(prefix)}
<script src="${prefix}assets/js/progress-data.js"></script>
<script src="${prefix}assets/js/search-index.js"></script>
<script src="${prefix}assets/js/app.js"></script>
</body>
</html>
`;
}

/* --------------------------------------------------------------------------
   Shared fragments
   -------------------------------------------------------------------------- */
function programCard(mod, prefix) {
  return `<a class="program-card reveal" href="${moduleUrl(mod, prefix)}" style="--accent:${mod.accent};--accent-soft:${mod.accentSoft}" data-progress-module="${mod.id}">
  <div class="program-card__top">
    <span class="program-card__code">المسار ${mod.code}</span>
    <span class="pill pill--accent">${esc(mod.level)}</span>
  </div>
  <div>
    <h3 class="program-card__title">${esc(mod.title)}</h3>
    <p class="program-card__tagline">${esc(mod.tagline)}</p>
  </div>
  <p class="program-card__desc">${esc(mod.description)}</p>
  <div class="program-card__meta">
    <span class="pill">${mod.lessons.length} درسًا</span>
    <span class="pill">${esc(mod.duration)}</span>
    <span class="pill">PDF</span>
  </div>
  <div class="program-card__foot">
    <span class="program-card__progress"><span class="bar"><i></i></span><span data-progress-text>0%</span></span>
    <span class="program-card__link">استكشف المسار ${icon("arrow")}</span>
  </div>
</a>`;
}

function programRows() {
  return `<div class="hero__programs">
    ${MODULES.map((m) => `<a class="hero__program" href="${moduleUrl(m)}" style="--accent:${m.accent}">
      <span class="hero__program-code">${m.code}</span>
      <span><span class="hero__program-title">${esc(m.title)}</span><br><span class="hero__program-meta">${m.lessons.length} درسًا · ${esc(m.level)}</span></span>
      ${icon("arrow")}
    </a>`).join("")}
  </div>`;
}

function lessonRow(mod, lesson, prefix) {
  return `<a class="lesson-row" href="${lessonUrl(mod, lesson, prefix)}" data-lesson-row="${lesson.id}">
  <span class="lesson-row__num">${pad(lesson.number)}</span>
  <span class="lesson-row__body">
    <span class="lesson-row__title">${esc(lesson.title)}</span>
    <span class="lesson-row__meta">${esc(lesson.duration)} · ${esc(lesson.level)}</span>
  </span>
  <span class="lesson-row__state">غير مكتمل</span>
  ${icon("arrow")}
</a>`;
}

/* --------------------------------------------------------------------------
   Home page
   -------------------------------------------------------------------------- */
function homePage() {
  const featured = [
    [module1, module1.lessons[0]],
    [module2, module2.lessons[0]],
    [module3, module3.lessons[0]],
    [module4, module4.lessons[0]]
  ];
  const body = `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <span class="eyebrow">منصة تعليمية عربية · SDM13 ACADEMY</span>
      <h1 class="display h1 hero__title">تعلّم مهارة رقمية. <em>وابنِ مستقبلك</em> من المغرب.</h1>
      <p class="lead hero__lead">أربعة مسارات تدريبية عملية، 49 درسًا، وملفات PDF قابلة للتحميل. من تطوير الذات إلى التسويق الرقمي والتجارة الإلكترونية والتصميم الجرافيكي — بالعربية، وبخطوات قابلة للتطبيق.</p>
      <div class="hero__actions">
        <a class="btn" href="training.html">استكشف البرامج ${icon("arrow")}</a>
        <a class="btn btn--ghost" href="search.html">${icon("search")} ابحث في الدروس</a>
      </div>
      <div class="hero__proof">
        <span>${icon("checkCircle")} بدون تسجيل أو حسابات</span>
        <span>${icon("checkCircle")} تقدمك محفوظ على جهازك</span>
        <span>${icon("checkCircle")} ملفات PDF مجانية</span>
      </div>
    </div>
    <aside class="hero__visual reveal" aria-label="نظرة سريعة على المسارات">
      <div class="hero__visual-top">
        ${brand("")}
        <span class="hero__visual-label">LEARNING HUB</span>
      </div>
      <div class="hero__big">
        <strong>49</strong>
        <span>درسًا عمليًا موزعة على أربعة مسارات متكاملة، مع تمارين وتقييمات وملفات PDF.</span>
      </div>
      ${programRows()}
      <div class="hero__visual-foot">
        <span>4 مسارات · 4 ملفات PDF</span>
        <a href="training.html">عرض الكل</a>
      </div>
    </aside>
  </div>
</section>

<div class="wrap">
  <div class="stat-strip reveal">
    <div class="stat-strip__item"><strong>04</strong><span>مسارات تدريبية</span></div>
    <div class="stat-strip__item"><strong>49</strong><span>درسًا كاملًا</span></div>
    <div class="stat-strip__item"><strong>04</strong><span>ملفات PDF منسقة</span></div>
    <div class="stat-strip__item"><strong>100%</strong><span>محتوى عربي</span></div>
  </div>
</div>

<section class="section" id="programs">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div class="section-head__text">
        <span class="eyebrow">المسارات الأربعة</span>
        <h2 class="display h2">اختر المسار الذي يخدم هدفك القادم.</h2>
        <p class="lead">كل مسار يبدأ من الأساسيات، ينتقل إلى التطبيق، وينتهي بمشروع أو خطة عملية. يمكنك التعلم بالترتيب أو البدء من الدرس الذي تحتاجه.</p>
      </div>
      <a class="btn btn--ghost" href="training.html">مقارنة البرامج ${icon("arrow")}</a>
    </div>
    <div class="program-grid">
      ${MODULES.map((m) => programCard(m, "")).join("")}
    </div>
  </div>
</section>

<section class="section section--tight" id="why">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">لماذا SDM13</span>
      <h2 class="display h2">تعلم واضح، بلا حشو وبلا وعود فارغة.</h2>
    </div>
    <div class="feature-grid">
      <article class="feature reveal"><span class="feature__icon">${icon("target")}</span><h3>محتوى مبني على هدف</h3><p>كل درس يبدأ بأهداف واضحة وينتهي بتمرين وخلاصة، حتى تعرف ما تعلمته وما الخطوة التالية.</p></article>
      <article class="feature reveal"><span class="feature__icon">${icon("globe")}</span><h3>سياق مغربي واقعي</h3><p>أمثلة من المدن المغربية والسوق المحلي، مع تنبيه واضح عند الحاجة إلى التحقق من المعلومات القانونية أو الضريبية.</p></article>
      <article class="feature reveal"><span class="feature__icon">${icon("device")}</span><h3>يعمل على الهاتف</h3><p>واجهة عربية من اليمين إلى اليسار، سريعة ومتجاوبة، مع قارئ دروس مريح وتنقل بين الدروس.</p></article>
      <article class="feature reveal"><span class="feature__icon">${icon("chart")}</span><h3>تقدم مرئي</h3><p>علّم الدروس المكتملة وشاهد نسبة تقدمك في كل مسار. البيانات تبقى على جهازك ولا تُرسل إلى أي خادم.</p></article>
      <article class="feature reveal"><span class="feature__icon">${icon("download")}</span><h3>ملفات PDF للتحميل</h3><p>نسخة كاملة من كل مسار بصيغة A4، تشمل الغلاف والفهرس والدروس والتمارين والتقييم النهائي.</p></article>
      <article class="feature reveal"><span class="feature__icon">${icon("search")}</span><h3>بحث فوري</h3><p>ابحث في عناوين الدروس والمقدمات والمصطلحات، وصفِّ النتائج حسب المسار للوصول بسرعة.</p></article>
    </div>
  </div>
</section>

<section class="section" id="how">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">كيف تتعلم</span>
      <h2 class="display h2">أربع خطوات من أول درس إلى نتيجة ملموسة.</h2>
    </div>
    <div class="steps reveal">
      <div class="step"><span class="step__num">01</span><h3>اختر مسارك</h3><p>ابدأ بالمسار الأقرب لهدفك، أو تصفح الدروس وابحث عن موضوع محدد.</p></div>
      <div class="step"><span class="step__num">02</span><h3>اقرأ وطبّق</h3><p>كل درس يشرح الفكرة ثم يقدم خطوات وتمرينًا تطبيقيًا يمكن إنجازه في وقت قصير.</p></div>
      <div class="step"><span class="step__num">03</span><h3>اختبر فهمك</h3><p>أجب عن أسئلة التقييم السريع، وراجع الشرح عند كل إجابة خاطئة.</p></div>
      <div class="step"><span class="step__num">04</span><h3>تابع تقدمك</h3><p>علّم الدرس كمكتمل، وتابع نسبة الإنجاز، وحمّل ملف PDF للمراجعة دون اتصال.</p></div>
    </div>
  </div>
</section>

<section class="section section--tight" id="featured">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div class="section-head__text">
        <span class="eyebrow">دروس مختارة</span>
        <h2 class="display h2">ابدأ من هنا.</h2>
      </div>
      <a class="btn btn--ghost" href="search.html">كل الدروس ${icon("arrow")}</a>
    </div>
    <div class="program-grid">
      ${featured.map(([m, l]) => `<a class="card reveal" href="${lessonUrl(m, l)}" style="--accent:${m.accent};--accent-soft:${m.accentSoft};padding:24px;display:flex;flex-direction:column;gap:10px">
        <span class="pill pill--accent">${esc(m.title)} · الدرس ${pad(l.number)}</span>
        <h3 class="h3">${esc(l.title)}</h3>
        <p class="muted" style="font-size:13.5px;line-height:1.8">${esc(l.intro.slice(0, 150))}…</p>
        <span class="program-card__link" style="margin-top:auto">ابدأ الدرس ${icon("arrow")}</span>
      </a>`).join("")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-band reveal">
      <div>
        <h2 class="display h2">جاهز تبدأ؟ المسار الكامل في انتظارك.</h2>
        <p>اختر برنامجًا، اقرأ الدروس، حمّل PDF، وطبّق التمارين. لا حاجة إلى حساب، ولا رسوم مخفية.</p>
      </div>
      <div class="cta-band__actions">
        <a class="btn" href="training.html">عرض البرامج ${icon("arrow")}</a>
        <a class="btn btn--ghost" href="contact.html">تواصل معنا</a>
      </div>
    </div>
  </div>
</section>`;
  return pageShell({
    prefix: "",
    title: "منصة تعلم عربية عملية",
    description: "SDM13 ACADEMY: أربعة مسارات عربية في تطوير الذات والتسويق الرقمي والتجارة الإلكترونية والتصميم الجرافيكي. 49 درسًا وملفات PDF.",
    active: "home",
    body
  });
}

/* --------------------------------------------------------------------------
   Training page
   -------------------------------------------------------------------------- */
function trainingPage() {
  const body = `
<section class="page-hero">
  <div class="wrap page-hero__inner">
    <span class="eyebrow">البرامج التدريبية</span>
    <h1 class="display h1">أربعة مسارات. 49 درسًا. طريق واحد إلى مهارة حقيقية.</h1>
    <p class="lead">كل برنامج مستقل ومتكامل: أهداف واضحة، شرح نظري، أمثلة مغربية، خطوات تطبيقية، تمارين، تقييم، وخلاصة. اختر مسارًا واحدًا أو اجمع أكثر من مسار حسب هدفك.</p>
    <div class="page-hero__meta">
      <span class="pill pill--solid">4 برامج</span>
      <span class="pill">49 درسًا</span>
      <span class="pill">4 ملفات PDF</span>
      <span class="pill">تقدم محفوظ محليًا</span>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="program-grid">
      ${MODULES.map((m) => programCard(m, "")).join("")}
    </div>
  </div>
</section>

${MODULES.map((m) => `
<section class="section section--tight" id="program-${m.code}" style="--accent:${m.accent};--accent-soft:${m.accentSoft}">
  <div class="wrap">
    <div class="card" style="padding:clamp(22px,4vw,40px);border-top:5px solid var(--accent)">
      <div class="section-head section-head--row" style="margin-bottom:24px">
        <div class="section-head__text">
          <span class="eyebrow">المسار ${m.code} · ${esc(m.titleEn)}</span>
          <h2 class="display h2">${esc(m.title)}</h2>
          <p class="program-card__tagline">${esc(m.tagline)}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn btn--sm" href="${moduleUrl(m)}">استكشف المسار ${icon("arrow")}</a>
          <a class="btn btn--ghost btn--sm" href="${pdfUrl(m)}" download>${icon("download")} تحميل PDF</a>
        </div>
      </div>
      <p class="lead" style="font-size:15px;max-width:80ch">${esc(m.description)}</p>
      <div class="split-cards" style="margin-top:24px">
        <div class="mini-card">
          <h3 style="color:var(--accent)">ماذا ستتعلم</h3>
          <ul class="objectives" style="grid-template-columns:1fr">
            ${m.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}
          </ul>
        </div>
        <div class="mini-card">
          <h3 style="color:var(--accent)">تفاصيل المسار</h3>
          <div class="module-side" style="border:0;padding:0;background:transparent;box-shadow:none">
            <div class="module-side__row"><span>عدد الدروس</span><strong>${m.lessons.length} درسًا</strong></div>
            <div class="module-side__row"><span>المستوى</span><strong>${esc(m.level)}</strong></div>
            <div class="module-side__row"><span>المدة التقديرية</span><strong>${esc(m.duration)}</strong></div>
            <div class="module-side__row"><span>التقييم</span><strong>${m.finalQuiz.length} أسئلة نهائية</strong></div>
            <div class="module-side__row"><span>ملف PDF</span><strong>متوفر</strong></div>
          </div>
        </div>
      </div>
      <div class="download-card" style="margin-top:24px">
        <div class="download-card__body">
          <span class="download-card__icon">${icon("download")}</span>
          <div><h3>نسخة PDF كاملة — ${esc(m.title)}</h3><p>غلاف، فهرس، جميع الدروس والتمارين والتقييم النهائي، بحجم A4.</p></div>
        </div>
        <a class="btn btn--sm" href="${pdfUrl(m)}" download>تحميل الملف ${icon("download")}</a>
      </div>
    </div>
  </div>
</section>`).join("")}

<section class="section">
  <div class="wrap">
    <div class="card" style="padding:clamp(22px,4vw,36px);border-inline-start:5px solid var(--orange)">
      <h2 class="display h3" style="margin-bottom:10px">ملاحظة صادقة قبل أن تبدأ</h2>
      <p class="muted" style="font-size:14px;line-height:1.9;max-width:85ch">هذه المنصة تعليمية ومفتوحة، ولا تقدم شهادات معتمدة، ولا حسابات طلاب، ولا إحصاءات أو آراء متعلمين غير حقيقية. التقدم يُحفظ في متصفحك فقط. المحتوى القانوني والضريبي في مسار التجارة الإلكترونية إرشادي، ويجب التحقق منه من المصادر الرسمية أو مع محاسب معتمد. نواصل تطوير المنصة، ونرحب بملاحظاتك عبر صفحة التواصل.</p>
    </div>
  </div>
</section>`;
  return pageShell({
    prefix: "",
    title: "البرامج التدريبية",
    description: "أربعة برامج عربية متكاملة: تطوير الذات، التسويق الرقمي، التجارة الإلكترونية، والتصميم الجرافيكي. 49 درسًا مع ملفات PDF.",
    active: "programs",
    body
  });
}

/* --------------------------------------------------------------------------
   Search page
   -------------------------------------------------------------------------- */
function searchPage() {
  const chips = [`<button class="filter-chip" type="button" data-search-filter="all" aria-pressed="true">كل المسارات</button>`]
    .concat(MODULES.map((m) => `<button class="filter-chip" type="button" data-search-filter="${m.id}" aria-pressed="false">${esc(m.title)}</button>`))
    .join("");
  const body = `
<section class="page-hero">
  <div class="wrap page-hero__inner">
    <span class="eyebrow">البحث</span>
    <h1 class="display h1">ابحث في 49 درسًا.</h1>
    <p class="lead">اكتب كلمة في العنوان أو المقدمة أو المصطلح، أو صفِّ النتائج حسب المسار. البحث يعمل محليًا في متصفحك دون إرسال أي استعلام.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap" style="max-width:900px">
    <div class="search-panel">
      <div class="search-field">
        ${icon("search")}
        <input id="search-input" type="search" placeholder="مثال: التسعير، الهوية البصرية، خدمة العملاء…" aria-label="البحث في الدروس" autocomplete="off">
      </div>
      <div class="search-filters" role="group" aria-label="تصفية حسب المسار">${chips}</div>
      <p class="search-status" id="search-status" aria-live="polite">أحدث الدروس والوحدات. اكتب كلمة للبحث في العناوين والمقدمات والمصطلحات.</p>
    </div>
    <div class="search-results" id="search-results" aria-live="polite"></div>
  </div>
</section>`;
  return pageShell({
    prefix: "",
    title: "البحث في الدروس",
    description: "ابحث في عناوين ومقدمات ومصطلحات دروس SDM13 ACADEMY الأربعة.",
    active: "search",
    body
  });
}

/* --------------------------------------------------------------------------
   Contact page
   -------------------------------------------------------------------------- */
function contactPage() {
  const options = MODULES.map((m) => `<option value="${esc(m.title)}">${esc(m.title)}</option>`).join("");
  const body = `
<section class="page-hero">
  <div class="wrap page-hero__inner">
    <span class="eyebrow">التواصل</span>
    <h1 class="display h1">سؤال، ملاحظة، أو اقتراح؟</h1>
    <p class="lead">نقرأ الرسائل ونستخدمها لتحسين المحتوى وتجربة المنصة. لا يوجد نموذج يخزن بياناتك على خادم: بعد التحقق من الحقول، ستُفتح رسالة واتساب جاهزة للإرسال.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap contact-grid">
    <form class="form-card" id="contact-form" novalidate>
      <div class="form-row">
        <div class="field">
          <label for="field-name">الاسم الكامل <span class="req">*</span></label>
          <input id="field-name" name="name" type="text" autocomplete="name" placeholder="اكتب اسمك" required>
          <span class="field__error" role="alert"></span>
        </div>
        <div class="field">
          <label for="field-contact">الهاتف أو البريد الإلكتروني <span class="req">*</span></label>
          <input id="field-contact" name="contact" type="text" autocomplete="email" placeholder="مثال: 06XXXXXXXX أو name@email.com" required>
          <span class="field__error" role="alert"></span>
        </div>
      </div>
      <div class="field">
        <label for="field-program">البرنامج الذي يهمك</label>
        <select id="field-program" name="program">
          <option value="غير محدد">اختر برنامجًا (اختياري)</option>
          ${options}
          <option value="استفسار عام">استفسار عام</option>
        </select>
      </div>
      <div class="field">
        <label for="field-message">رسالتك <span class="req">*</span></label>
        <textarea id="field-message" name="message" placeholder="اكتب سؤالك أو ملاحظتك بوضوح…" required></textarea>
        <span class="field__hint">10 أحرف على الأقل. لا تشارك معلومات حساسة.</span>
        <span class="field__error" role="alert"></span>
      </div>
      <button class="btn" type="submit">${icon("whatsapp")} تجهيز الرسالة في واتساب</button>
      <p class="form-note">بالضغط على الزر، نتحقق من الحقول ثم نفتح واتساب برسالة جاهزة على الرقم ${SITE.phone}. لا يتم حفظ بياناتك في الموقع، ولا نستخدمها لأي غرض آخر.</p>
      <div class="form-status" id="form-status" role="status" aria-live="polite"></div>
    </form>
    <aside class="contact-side">
      <div class="contact-card contact-card--dark">
        <h2>تواصل مباشر</h2>
        <p>واتساب هو أسرع وسيلة للوصول إلينا. اذكر اسمك والبرنامج وموضوع الرسالة لتسريع الرد.</p>
        <a class="contact-link" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">${icon("whatsapp")} ${SITE.phone}</a>
      </div>
      <div class="contact-card">
        <h2>قبل أن ترسل</h2>
        <ul class="contact-list">
          <li>${icon("checkCircle")} حدد البرنامج أو الدرس الذي تسأل عنه.</li>
          <li>${icon("checkCircle")} اكتب سؤالًا محددًا بدل رسالة عامة.</li>
          <li>${icon("checkCircle")} لا تشارك كلمات مرور أو بيانات دفع.</li>
          <li>${icon("checkCircle")} للأسئلة القانونية أو الضريبية، راجع مصدرًا رسميًا أو محاسبًا.</li>
        </ul>
      </div>
      <div class="contact-card">
        <h2>ما لا تقدمه المنصة</h2>
        <p>لا حسابات طلاب، ولا شهادات معتمدة، ولا متابعة فردية أو استشارات مدفوعة. المنصة محتوى تعليمي مفتوح، والتقدم محلي على جهازك.</p>
      </div>
    </aside>
  </div>
</section>`;
  return pageShell({
    prefix: "",
    title: "التواصل",
    description: "تواصل مع SDM13 ACADEMY عبر واتساب. نموذج تحقق محلي يجهز رسالتك دون تخزين بيانات.",
    active: "contact",
    body
  });
}

/* --------------------------------------------------------------------------
   Module page
   -------------------------------------------------------------------------- */
function modulePage(mod) {
  const prefix = "../";
  const prev = prevModule(mod);
  const next = nextModule(mod);
  const body = `
<section class="module-hero">
  <div class="wrap module-hero__grid">
    <div class="module-hero__copy">
      <div class="breadcrumb"><a href="${prefix}index.html">الرئيسية</a><span aria-hidden="true">/</span><a href="${prefix}training.html">البرامج</a><span aria-hidden="true">/</span><span>المسار ${mod.code}</span></div>
      <span class="module-hero__code">${mod.code}</span>
      <span class="eyebrow">${esc(mod.titleEn)}</span>
      <h1 class="display h1">${esc(mod.title)}</h1>
      <p class="module-hero__tagline">${esc(mod.tagline)}</p>
      <p class="lead">${esc(mod.description)}</p>
      <div class="module-hero__actions">
        <a class="btn" href="${lessonUrl(mod, mod.lessons[0], prefix)}">ابدأ الدرس الأول ${icon("arrow")}</a>
        <a class="btn btn--ghost" href="${pdfUrl(mod, prefix)}" download>${icon("download")} تحميل PDF</a>
      </div>
    </div>
    <aside class="module-side">
      <div class="module-side__row"><span>الدروس</span><strong>${mod.lessons.length} درسًا</strong></div>
      <div class="module-side__row"><span>المستوى</span><strong>${esc(mod.level)}</strong></div>
      <div class="module-side__row"><span>المدة</span><strong>${esc(mod.duration)}</strong></div>
      <div class="module-progress" data-progress-module="${mod.id}">
        <div class="module-side__row"><span>تقدمك</span><strong data-progress-label>0 / ${mod.lessons.length}</strong></div>
        <div class="bar"><i></i></div>
      </div>
      <p class="module-side__note">يُحفظ تقدمك في هذا المتصفح فقط. لا حاجة إلى تسجيل، ولا تُرسل بيانات إلى خادم.</p>
    </aside>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">أهداف المسار</span>
      <h2 class="display h2">ماذا ستكون قادرًا على فعله؟</h2>
    </div>
    <ul class="objectives">
      ${mod.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}
    </ul>
  </div>
</section>

<section class="section section--tight" id="lessons">
  <div class="wrap">
    <div class="section-head section-head--row">
      <div class="section-head__text">
        <span class="eyebrow">محتوى المسار</span>
        <h2 class="display h2">${mod.lessons.length} درسًا، بالترتيب.</h2>
      </div>
      <a class="btn btn--ghost btn--sm" href="${pdfUrl(mod, prefix)}" download>${icon("download")} نسخة PDF</a>
    </div>
    <div class="lesson-list" data-progress-lesson-list="${mod.id}">
      ${mod.lessons.map((l) => lessonRow(mod, l, prefix)).join("")}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">التقييم النهائي</span>
      <h2 class="display h2">اختبر فهمك للمسار كاملًا.</h2>
      <p class="lead">${mod.finalQuiz.length} أسئلة تغطي أهم أفكار المسار. يمكنك إعادة المحاولة، والإجابة الصحيحة تظهر مع شرح قصير.</p>
    </div>
    <div class="card" style="padding:clamp(18px,3vw,30px)">
      ${renderQuiz(mod.finalQuiz, `${mod.id}-final`)}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="download-card">
      <div class="download-card__body">
        <span class="download-card__icon">${icon("download")}</span>
        <div><h3>ملف PDF كامل — ${esc(mod.title)}</h3><p>A4 · غلاف وفهرس وجميع الدروس والتمارين والتقييم النهائي.</p></div>
      </div>
      <a class="btn btn--sm" href="${pdfUrl(mod, prefix)}" download>تحميل ${icon("download")}</a>
    </div>
    <div class="module-next" style="margin-top:14px">
      <span>${next ? `المسار التالي: <strong>${esc(next.title)}</strong>` : "هذا آخر مسار في المنصة."}</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${prev ? `<a class="btn btn--ghost btn--sm" href="${moduleUrl(prev, prefix)}">${icon("arrowLeft")} ${esc(prev.title)}</a>` : ""}
        ${next ? `<a class="btn btn--sm" href="${moduleUrl(next, prefix)}">${esc(next.title)} ${icon("arrow")}</a>` : `<a class="btn btn--sm" href="${prefix}training.html">كل البرامج ${icon("arrow")}</a>`}
      </div>
    </div>
  </div>
</section>`;
  return pageShell({
    prefix,
    title: mod.title,
    description: mod.description,
    active: "programs",
    bodyAttrs: `data-page="module" data-module="${mod.id}" style="--accent:${mod.accent};--accent-soft:${mod.accentSoft}"`,
    body
  });
}

/* --------------------------------------------------------------------------
   Quiz renderer
   -------------------------------------------------------------------------- */
function renderQuiz(quiz, id) {
  const letters = ["أ", "ب", "ج", "د", "هـ"];
  return `<div class="quiz" id="quiz-${id}">
  <div class="quiz__head">
    <span class="quiz__score" data-quiz-score>النتيجة: <strong>0</strong> من ${quiz.length}</span>
    <button class="btn btn--ghost btn--sm" type="button" data-quiz-reset>إعادة المحاولة</button>
  </div>
  ${quiz.map((q, qi) => `<div class="quiz-q" data-answered="">
    <div class="quiz-q__title"><span class="quiz-q__num">${qi + 1}</span><span>${esc(q.q)}</span></div>
    <div class="quiz-options">
      ${q.options.map((opt, oi) => `<button class="quiz-option" type="button" data-correct="${oi === q.answer ? "true" : "false"}">
        <span class="quiz-option__key">${letters[oi] || oi + 1}</span><span>${esc(opt)}</span>
      </button>`).join("")}
    </div>
    <div class="quiz-feedback" data-explain="${esc(q.explain)}"></div>
  </div>`).join("")}
</div>`;
}

/* --------------------------------------------------------------------------
   Lesson page
   -------------------------------------------------------------------------- */
function lessonSections() {
  return [
    { id: "intro", label: "مقدمة الدرس" },
    { id: "objectives", label: "أهداف الدرس" },
    { id: "theory", label: "الشرح النظري" },
    { id: "terms", label: "مصطلحات أساسية" },
    { id: "examples", label: "أمثلة مغربية" },
    { id: "steps", label: "خطوات تطبيقية" },
    { id: "tips", label: "نصائح عملية" },
    { id: "mistakes", label: "أخطاء شائعة" },
    { id: "exercise", label: "تمرين تطبيقي" },
    { id: "quiz", label: "تقييم سريع" },
    { id: "summary", label: "خلاصة الدرس" },
    { id: "next", label: "الدرس التالي" }
  ];
}

function lessonPage(mod, lesson) {
  const prefix = "../../";
  const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = idx > 0 ? mod.lessons[idx - 1] : null;
  const nextLesson = idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null;
  const nextMod = nextModule(mod);
  const sections = lessonSections();
  const toc = sections.map((s) => `<li><a href="#${s.id}">${s.label}</a></li>`).join("");

  const prevHref = prevLesson ? lessonUrl(mod, prevLesson, prefix) : moduleUrl(mod, prefix);
  const prevLabel = prevLesson ? prevLesson.title : `العودة إلى ${mod.title}`;
  const nextHref = nextLesson ? lessonUrl(mod, nextLesson, prefix) : (nextMod ? moduleUrl(nextMod, prefix) : `${prefix}training.html`);
  const nextLabel = nextLesson ? nextLesson.title : (nextMod ? `المسار التالي: ${nextMod.title}` : "جميع البرامج");

  const body = `
<section class="lesson-header" style="--accent:${mod.accent};--accent-soft:${mod.accentSoft}">
  <div class="wrap lesson-header__inner">
    <div class="breadcrumb"><a href="${prefix}index.html">الرئيسية</a><span aria-hidden="true">/</span><a href="${prefix}training.html">البرامج</a><span aria-hidden="true">/</span><a href="${moduleUrl(mod, prefix)}">${esc(mod.title)}</a><span aria-hidden="true">/</span><span>الدرس ${pad(lesson.number)}</span></div>
    <div class="lesson-kicker">
      <span class="pill pill--accent">المسار ${mod.code} · ${esc(mod.title)}</span>
      <span class="pill">الدرس ${pad(lesson.number)} من ${pad(mod.lessons.length)}</span>
      <span class="pill">${icon("clock")} ${esc(lesson.duration)}</span>
      <span class="pill">${esc(lesson.level)}</span>
    </div>
    <h1 class="display">${esc(lesson.title)}</h1>
    <p class="lesson-header__lead">${esc(lesson.intro)}</p>
    <div class="lesson-toolbar">
      <button class="done-btn" type="button" data-done-lesson="${lesson.id}" aria-pressed="false">${icon("checkCircle")} <span data-done-label>أكملت هذا الدرس</span></button>
      <a class="btn btn--ghost btn--sm" href="${pdfUrl(mod, prefix)}" download>${icon("download")} PDF المسار</a>
      <a class="btn btn--ghost btn--sm" href="${moduleUrl(mod, prefix)}">${icon("list")} كل الدروس</a>
    </div>
  </div>
</section>

<div class="wrap lesson-layout">
  <article class="lesson-article">
    <section class="lesson-section" id="intro">
      <h2><span class="num">01</span> مقدمة الدرس</h2>
      <p>${esc(lesson.intro)}</p>
    </section>

    <section class="lesson-section" id="objectives">
      <h2><span class="num">02</span> أهداف الدرس</h2>
      <ul class="objective-list">${lesson.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
    </section>

    <section class="lesson-section" id="theory">
      <h2><span class="num">03</span> الشرح النظري</h2>
      ${lesson.theory.map((block) => `<div class="theory-block">
        <h3>${esc(block.h)}</h3>
        ${block.p.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>`).join("")}
    </section>

    <section class="lesson-section" id="terms">
      <h2><span class="num">04</span> مصطلحات أساسية</h2>
      <dl class="term-list">${lesson.terms.map((t) => `<div><dt>${esc(t.term)}</dt><dd>${esc(t.def)}</dd></div>`).join("")}</dl>
    </section>

    <section class="lesson-section" id="examples">
      <h2><span class="num">05</span> أمثلة من الواقع المغربي</h2>
      <ul class="example-list">${lesson.examples.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
    </section>

    <section class="lesson-section" id="steps">
      <h2><span class="num">06</span> خطوات تطبيقية</h2>
      <ol class="numbered">${lesson.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    </section>

    <section class="lesson-section" id="tips">
      <h2><span class="num">07</span> نصائح عملية</h2>
      <ul class="objective-list">${lesson.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
    </section>

    <section class="lesson-section" id="mistakes">
      <h2><span class="num">08</span> أخطاء شائعة</h2>
      <div class="split-cards">
        <div class="mini-card mini-card--good">
          <h3>افعل هذا</h3>
          <ul>${lesson.tips.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>
        <div class="mini-card mini-card--bad">
          <h3>تجنّب هذا</h3>
          <ul>${lesson.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>

    <section class="lesson-section" id="exercise">
      <h2><span class="num">09</span> تمرين تطبيقي</h2>
      <div class="exercise">
        <div class="exercise__title">${esc(lesson.exercise.title)}</div>
        <p class="exercise__brief">${esc(lesson.exercise.brief)}</p>
        <ol class="numbered">${lesson.exercise.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <p class="exercise__deliverable"><strong>المطلوب تسليمه:</strong> ${esc(lesson.exercise.deliverable)}</p>
      </div>
    </section>

    <section class="lesson-section" id="quiz">
      <h2><span class="num">10</span> تقييم سريع</h2>
      <p class="muted" style="font-size:12.5px;margin-bottom:14px">أجب عن الأسئلة التالية. ستظهر الإجابة الصحيحة مع شرح قصير بعد كل اختيار.</p>
      ${renderQuiz(lesson.quiz, lesson.id)}
    </section>

    <section class="lesson-section" id="summary">
      <h2><span class="num">11</span> خلاصة الدرس</h2>
      <div class="summary-box">${esc(lesson.summary)}</div>
    </section>

    <section class="lesson-section" id="next">
      <h2><span class="num">12</span> الاستعداد للدرس التالي</h2>
      <div class="next-box">${icon("arrow")}<p>${esc(lesson.next)}</p></div>
    </section>

    <nav class="lesson-nav" aria-label="التنقل بين الدروس">
      <a href="${prevHref}"><span>السابق</span><strong>${esc(prevLabel)}</strong></a>
      <a href="${nextHref}"><span>التالي</span><strong>${esc(nextLabel)}</strong></a>
    </nav>
  </article>

  <aside class="lesson-toc" aria-label="محتويات الدرس">
    <h2>محتويات الدرس</h2>
    <ol>${toc}</ol>
    <a class="lesson-toc__pdf" href="${pdfUrl(mod, prefix)}" download>${icon("download")} تحميل PDF المسار</a>
    <a class="lesson-toc__pdf" href="${moduleUrl(mod, prefix)}">${icon("list")} جميع دروس المسار</a>
  </aside>
</div>`;
  return pageShell({
    prefix,
    title: lesson.title,
    description: lesson.intro,
    active: "programs",
    bodyAttrs: `data-page="lesson" data-lesson="${lesson.id}" data-module="${mod.id}" style="--accent:${mod.accent};--accent-soft:${mod.accentSoft}"`,
    body
  });
}

/* --------------------------------------------------------------------------
   Generated data + print documents
   -------------------------------------------------------------------------- */
function progressData() {
  return `window.SDM13_MODULES = ${JSON.stringify(MODULES.map((m) => ({ id: m.id, title: m.title, lessons: m.lessons.map((l) => l.id) })))};\n`;
}

function searchIndex() {
  const items = [];
  for (const m of MODULES) {
    for (const l of m.lessons) {
      items.push({
        module: m.id,
        moduleTitle: m.title,
        number: l.number,
        title: l.title,
        duration: l.duration,
        intro: l.intro,
        terms: l.terms.map((t) => t.term),
        url: lessonUrl(m, l)
      });
    }
  }
  return `window.SDM13_SEARCH = ${JSON.stringify(items)};\n`;
}

function printFonts() {
  const base = "../../assets/fonts";
  return `
@font-face{font-family:"Cairo";src:url("${base}/Cairo-400.ttf") format("truetype");font-weight:400;font-display:swap}
@font-face{font-family:"Cairo";src:url("${base}/Cairo-600.ttf") format("truetype");font-weight:600;font-display:swap}
@font-face{font-family:"Cairo";src:url("${base}/Cairo-700.ttf") format("truetype");font-weight:700;font-display:swap}
@font-face{font-family:"Cairo";src:url("${base}/Cairo-800.ttf") format("truetype");font-weight:800;font-display:swap}
@font-face{font-family:"Tajawal";src:url("${base}/Tajawal-400.ttf") format("truetype");font-weight:400;font-display:swap}
@font-face{font-family:"Tajawal";src:url("${base}/Tajawal-500.ttf") format("truetype");font-weight:500;font-display:swap}
@font-face{font-family:"Tajawal";src:url("${base}/Tajawal-700.ttf") format("truetype");font-weight:700;font-display:swap}`;
}

function printCss() {
  return `${printFonts()}
@page{size:A4;margin:19mm 17mm 20mm}
*{box-sizing:border-box}
html{direction:rtl}
body{margin:0;font-family:"Cairo",sans-serif;color:#161613;font-size:10.4pt;line-height:1.85;background:#fff}
h1,h2,h3,h4{font-family:"Tajawal","Cairo",sans-serif;margin:0;line-height:1.3}
p{margin:0 0 7pt}
ul,ol{margin:0 0 8pt;padding:0}
li{margin:0 0 3pt}
a{color:inherit;text-decoration:none}
.print-cover{height:297mm;padding:19mm 17mm 20mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always;position:relative;overflow:hidden}
.print-cover:before{content:"";position:absolute;inset-inline-start:-40mm;top:-40mm;width:120mm;height:120mm;border-radius:50%;background:#ff5500;opacity:.12}
.cover-top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1}
.cover-brand{display:flex;align-items:center;gap:8pt}
.cover-bars{display:flex;align-items:flex-end;gap:2pt;height:26pt}
.cover-bars i{display:block;width:5pt;background:#0a0a0a;border-radius:1pt}
.cover-bars i:nth-child(1){height:14pt}
.cover-bars i:nth-child(2){height:20pt}
.cover-bars i:nth-child(3){height:26pt;background:#ff5500}
.cover-bars i:nth-child(4){height:20pt}
.cover-bars i:nth-child(5){height:14pt}
.cover-word{font-family:"Tajawal",sans-serif;font-weight:700;font-size:20pt;line-height:1}
.cover-word small{display:block;font-family:"Cairo",sans-serif;font-size:6.5pt;letter-spacing:3pt;color:#62625a;margin-top:2pt}
.cover-label{font-size:8pt;letter-spacing:2pt;color:#62625a;font-weight:700}
.cover-main{padding-block:8mm;position:relative;z-index:1}
.cover-kicker{display:inline-block;padding:4pt 10pt;border:1pt solid #ff5500;border-radius:99pt;color:#ff5500;font-size:8pt;font-weight:700;margin-bottom:7mm}
.cover-title{font-size:34pt;font-weight:700;color:#0a0a0a;max-width:150mm;margin-bottom:4mm}
.cover-en{font-family:"Cairo",sans-serif;font-size:10pt;letter-spacing:2pt;color:#8a8a80;margin-bottom:6mm}
.cover-tagline{font-size:15pt;font-weight:700;color:#ff5500;margin-bottom:5mm}
.cover-desc{font-size:10.5pt;line-height:1.9;color:#3a3a35;max-width:150mm}
.cover-meta{display:flex;gap:5mm;flex-wrap:wrap;margin-top:9mm}
.cover-meta div{border:1pt solid #dcddd3;border-radius:5mm;padding:4mm 6mm;min-width:38mm}
.cover-meta strong{display:block;font-family:"Tajawal",sans-serif;font-size:15pt;line-height:1.2}
.cover-meta span{font-size:7.5pt;color:#62625a}
.cover-foot{display:flex;justify-content:space-between;align-items:flex-end;border-top:1pt solid #dcddd3;padding-top:5mm;font-size:8pt;color:#62625a;position:relative;z-index:1}
.cover-foot strong{color:#0a0a0a}
.print-page{page-break-after:always}
.print-page:last-child{page-break-after:auto}
.print-h1{font-size:24pt;margin-bottom:4mm;color:#0a0a0a}
.print-h2{font-size:16pt;margin:0 0 3mm;color:#0a0a0a}
.print-h3{font-size:11.5pt;margin:0 0 2mm;color:#1d1d19}
.print-kicker{font-size:7.5pt;letter-spacing:1.5pt;color:#ff5500;font-weight:700;margin-bottom:2mm}
.print-lead{font-size:10.2pt;line-height:1.95;color:#44443e;margin-bottom:5mm}
.print-meta{display:flex;flex-wrap:wrap;gap:2mm;margin-bottom:5mm}
.print-pill{display:inline-block;border:1pt solid #dcddd3;border-radius:99pt;padding:1.5pt 7pt;font-size:7.5pt;color:#62625a}
.print-toc{margin-top:4mm}
.print-toc ol{list-style:none;counter-reset:toc}
.print-toc li{display:flex;gap:4mm;padding:2.4mm 0;border-bottom:.6pt dashed #dcddd3;font-size:9.5pt}
.print-toc li:before{counter-increment:toc;content:counter(toc,decimal-leading-zero);color:#ff5500;font-weight:700;font-size:8pt;min-width:7mm}
.print-toc strong{font-weight:700}
.print-toc span{color:#8a8a80;font-size:8pt;margin-inline-start:auto;white-space:nowrap}
.print-lesson{page-break-before:always}
.print-lesson-head{border-bottom:2pt solid #0a0a0a;padding-bottom:4mm;margin-bottom:5mm}
.print-lesson-num{font-size:8pt;letter-spacing:1.6pt;color:#ff5500;font-weight:700}
.print-lesson-title{font-size:21pt;margin:1mm 0 2mm}
.print-lesson-meta{font-size:8pt;color:#62625a}
.print-section{margin-bottom:5mm}
.print-section h2{font-size:13pt;margin:0 0 2mm;display:flex;align-items:center;gap:2mm}
.print-section h2:before{content:"";width:4pt;height:4pt;border-radius:50%;background:#ff5500;flex:none}
.print-section p{text-align:justify}
.print-objectives{display:grid;grid-template-columns:1fr 1fr;gap:1mm 6mm;list-style:none;padding:0}
.print-objectives li{position:relative;padding-inline-start:4mm;font-size:9.5pt}
.print-objectives li:before{content:"✓";position:absolute;inset-inline-start:0;color:#ff5500;font-weight:700}
.print-terms{display:grid;grid-template-columns:38mm 1fr;gap:1mm 4mm;font-size:9pt}
.print-terms dt{font-weight:700;color:#ff5500}
.print-terms dd{margin:0}
.print-example{padding:2.5mm 3mm;border-inline-start:2.5pt solid #ff5500;background:#faf8f4;margin-bottom:2.5mm;font-size:9.3pt}
.print-steps{counter-reset:s;list-style:none;padding:0}
.print-steps li{counter-increment:s;position:relative;padding-inline-start:7mm;margin-bottom:2mm;font-size:9.5pt}
.print-steps li:before{content:counter(s,decimal-leading-zero);position:absolute;inset-inline-start:0;top:0;background:#0a0a0a;color:#fff;font-size:6.5pt;font-weight:700;padding:1pt 3pt;border-radius:2pt}
.print-two{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.print-box{border:1pt solid #dcddd3;border-radius:3mm;padding:3mm;font-size:9pt}
.print-box h3{margin-bottom:2mm;font-size:9.5pt}
.print-box--good{border-color:#bfe3cf;background:#f3fbf6}
.print-box--bad{border-color:#f2c9c5;background:#fdf6f5}
.print-quiz{margin-bottom:4mm;page-break-inside:avoid}
.print-quiz p{margin-bottom:1.5mm;font-weight:700;font-size:9.5pt}
.print-quiz ol{list-style:none;padding:0;margin:0}
.print-quiz li{font-size:9pt;padding:0.6mm 0;color:#44443e}
.print-answer{margin-top:1.5mm;font-size:8pt;color:#1f7a4d}
.print-summary{background:#0a0a0a;color:#f7f8f2;padding:4mm;border-radius:3mm;font-size:9.5pt;line-height:1.9}
.print-next{border:.8pt dashed #c6c8bb;padding:3mm;border-radius:3mm;font-size:9.2pt;color:#44443e}
.print-final{margin-top:4mm;padding:4mm;border:1pt solid #dcddd3;border-radius:3mm;background:#faf8f4}
.print-final table{width:100%;border-collapse:collapse;font-size:8.6pt;margin-top:2mm}
.print-final th,.print-final td{border-bottom:.6pt solid #dcddd3;padding:1.6mm 2mm;text-align:start;vertical-align:top}
.print-final th{color:#62625a;font-weight:700}
.print-foot{border-top:1pt solid #dcddd3;margin-top:8mm;padding-top:3mm;display:flex;justify-content:space-between;font-size:7.5pt;color:#8a8a80}
.print-note{font-size:8pt;color:#8a8a80;line-height:1.7;margin-top:3mm}
`;
}

function printCover(mod) {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(mod.title)} — غلاف</title><style>${printCss()}</style></head>
<body>
<div class="print-cover">
  <div class="cover-top">
    <div class="cover-brand"><span class="cover-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="cover-word">SDM13<small>ACADEMY</small></span></div>
    <span class="cover-label">برنامج تدريبي · ${mod.code}</span>
  </div>
  <div class="cover-main">
    <span class="cover-kicker">${esc(mod.titleEn)}</span>
    <h1 class="cover-title">${esc(mod.title)}</h1>
    <div class="cover-en">${esc(mod.tagline)}</div>
    <div class="cover-tagline">${esc(mod.objective)}</div>
    <p class="cover-desc">${esc(mod.description)}</p>
    <div class="cover-meta">
      <div><strong>${mod.lessons.length}</strong><span>درسًا كاملًا</span></div>
      <div><strong>${esc(mod.level)}</strong><span>المستوى</span></div>
      <div><strong>${esc(mod.duration.replace(" · نحو", " · "))}</strong><span>المدة التقديرية</span></div>
      <div><strong>${mod.finalQuiz.length}</strong><span>أسئلة تقييم نهائي</span></div>
    </div>
  </div>
  <div class="cover-foot">
    <span><strong>SDM13 ACADEMY</strong> — منصة تعلم عربية عملية</span>
    <span>الإصدار ${SITE.year} · A4</span>
  </div>
</div>
</body></html>`;
}

function printBody(mod) {
  const lessons = mod.lessons;
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(mod.title)}</title><style>${printCss()}</style></head>
<body>
<div class="print-page">
  <div class="print-kicker">المسار ${mod.code} · ${esc(mod.titleEn)}</div>
  <h1 class="print-h1">${esc(mod.title)}</h1>
  <p class="print-lead">${esc(mod.description)}</p>
  <div class="print-meta"><span class="print-pill">${lessons.length} درسًا</span><span class="print-pill">${esc(mod.level)}</span><span class="print-pill">${esc(mod.duration)}</span><span class="print-pill">${mod.finalQuiz.length} أسئلة نهائية</span></div>
  <div class="print-section"><h2>أهداف المسار</h2><ul class="print-objectives">${mod.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>
  <div class="print-section"><h2>الفهرس</h2><div class="print-toc"><ol>${lessons.map((l) => `<li><strong>${esc(l.title)}</strong><span>${esc(l.duration)}</span></li>`).join("")}<li><strong>التقييم النهائي</strong><span>${mod.finalQuiz.length} أسئلة</span></li><li><strong>خلاصة المسار</strong><span>مراجعة شاملة</span></li></ol></div></div>
  <p class="print-note">هذا الملف نسخة تعليمية للقراءة والمراجعة. المحتوى القانوني والضريبي في مسار التجارة الإلكترونية إرشادي، ويجب التحقق منه من المصادر الرسمية أو مع محاسب معتمد.</p>
  <div class="print-foot"><span>SDM13 ACADEMY</span><span>${esc(mod.title)}</span></div>
</div>

${lessons.map((l) => `<div class="print-lesson">
  <div class="print-lesson-head">
    <div class="print-lesson-num">الدرس ${pad(l.number)} · ${esc(mod.title)}</div>
    <h1 class="print-lesson-title">${esc(l.title)}</h1>
    <div class="print-lesson-meta">${esc(l.duration)} · ${esc(l.level)}</div>
  </div>
  <div class="print-section"><h2>مقدمة الدرس</h2><p>${esc(l.intro)}</p></div>
  <div class="print-section"><h2>أهداف الدرس</h2><ul class="print-objectives">${l.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>
  <div class="print-section"><h2>الشرح النظري</h2>${l.theory.map((t) => `<h3 class="print-h3">${esc(t.h)}</h3>${t.p.map((p) => `<p>${esc(p)}</p>`).join("")}`).join("")}</div>
  <div class="print-section"><h2>مصطلحات أساسية</h2><dl class="print-terms">${l.terms.map((t) => `<dt>${esc(t.term)}</dt><dd>${esc(t.def)}</dd>`).join("")}</dl></div>
  <div class="print-section"><h2>أمثلة من الواقع المغربي</h2>${l.examples.map((e) => `<p class="print-example">${esc(e)}</p>`).join("")}</div>
  <div class="print-section"><h2>خطوات تطبيقية</h2><ol class="print-steps">${l.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
  <div class="print-section"><h2>نصائح وأخطاء</h2><div class="print-two"><div class="print-box print-box--good"><h3>نصائح عملية</h3><ul>${l.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div><div class="print-box print-box--bad"><h3>أخطاء شائعة</h3><ul>${l.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div></div></div>
  <div class="print-section"><h2>تمرين تطبيقي: ${esc(l.exercise.title)}</h2><p>${esc(l.exercise.brief)}</p><ol class="print-steps">${l.exercise.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><p><strong>المطلوب:</strong> ${esc(l.exercise.deliverable)}</p></div>
  <div class="print-section"><h2>تقييم سريع</h2>${l.quiz.map((q, qi) => `<div class="print-quiz"><p>${qi + 1}. ${esc(q.q)}</p><ol>${q.options.map((o, oi) => `<li>${["أ", "ب", "ج", "د"][oi] || oi + 1}. ${esc(o)}</li>`).join("")}</ol><div class="print-answer">الإجابة الصحيحة: ${["أ", "ب", "ج", "د"][q.answer] || q.answer + 1} — ${esc(q.explain)}</div></div>`).join("")}</div>
  <div class="print-section"><h2>خلاصة الدرس</h2><div class="print-summary">${esc(l.summary)}</div></div>
  <div class="print-section"><h2>الاستعداد للدرس التالي</h2><div class="print-next">${esc(l.next)}</div></div>
  <div class="print-foot"><span>SDM13 ACADEMY · ${esc(mod.title)}</span><span>الدرس ${pad(l.number)}</span></div>
</div>`).join("")}

<div class="print-page">
  <div class="print-kicker">المراجعة الختامية</div>
  <h1 class="print-h1">التقييم النهائي</h1>
  <p class="print-lead">أجب عن الأسئلة التالية لمراجعة أهم أفكار المسار. الإجابات والشرح في نهاية القسم.</p>
  <div class="print-final">
    ${mod.finalQuiz.map((q, qi) => `<div class="print-quiz"><p>${qi + 1}. ${esc(q.q)}</p><ol>${q.options.map((o, oi) => `<li>${["أ", "ب", "ج", "د"][oi] || oi + 1}. ${esc(o)}</li>`).join("")}</ol></div>`).join("")}
    <h3 class="print-h3" style="margin-top:4mm">الإجابات والشرح</h3>
    <table><thead><tr><th>السؤال</th><th>الإجابة</th><th>الشرح</th></tr></thead><tbody>${mod.finalQuiz.map((q, qi) => `<tr><td>${qi + 1}</td><td>${["أ", "ب", "ج", "د"][q.answer] || q.answer + 1}</td><td>${esc(q.explain)}</td></tr>`).join("")}</tbody></table>
  </div>
  <div class="print-section" style="margin-top:6mm"><h2>خلاصة المسار</h2><div class="print-summary">${esc(mod.summary)}</div></div>
  <div class="print-section"><h2>ماذا بعد؟</h2><p>راجع الدروس التي لم تجب عنها بثقة، وطبّق تمرينًا واحدًا على الأقل من كل درس. يمكنك تحميل بقية المسارات من المنصة، والانتقال إلى التطبيق العملي في مشروعك أو عملك.</p><p class="print-note">هذه النسخة أُعدت للقراءة والمراجعة. المنصة لا تقدم شهادات معتمدة، والتقدم يُحفظ محليًا في المتصفح.</p></div>
  <div class="print-foot"><span>SDM13 ACADEMY · ${esc(mod.title)}</span><span>نهاية المسار</span></div>
</div>
</body></html>`;
}

/* --------------------------------------------------------------------------
   Build
   -------------------------------------------------------------------------- */
fs.mkdirSync(path.join(ROOT, "modules"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "lessons"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "public/pdfs"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "public/print"), { recursive: true });

write("index.html", homePage());
write("training.html", trainingPage());
write("search.html", searchPage());
write("contact.html", contactPage());
write("assets/js/progress-data.js", progressData());
write("assets/js/search-index.js", searchIndex());

for (const mod of MODULES) {
  write(`modules/module-${mod.code}.html`, modulePage(mod));
  for (const lesson of mod.lessons) {
    write(`lessons/module-${mod.code}/lesson-${pad(lesson.number)}.html`, lessonPage(mod, lesson));
  }
  write(`public/print/${mod.code}-cover.html`, printCover(mod));
  write(`public/print/${mod.code}-body.html`, printBody(mod));
}

write("public/print/index.json", JSON.stringify(MODULES.map((m) => ({
  id: m.id,
  code: m.code,
  title: m.title,
  cover: `public/print/${m.code}-cover.html`,
  body: `public/print/${m.code}-body.html`,
  pdf: `public/pdfs/${PDFS[m.id]}`
})), null, 2));

const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
console.log(`Built ${MODULES.length} modules, ${totalLessons} lessons, ${MODULES.length} print documents.`);

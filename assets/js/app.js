/* SDM13 ACADEMY — shared interactions (no framework, no external requests) */
(function () {
  "use strict";

  var STORE = {
    done: function (id) { return "sdm13:done:" + id; },
    theme: "sdm13:theme"
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage may be disabled */ }
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ----------------------------------------------------------------------
     Theme
     ---------------------------------------------------------------------- */
  var themeBtn = $("[data-theme-toggle]");
  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    $$("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن");
    });
  }
  applyTheme(read(STORE.theme, "light"));
  $$("[data-theme-toggle]").forEach(function (btn) {
    on(btn, "click", function () {
      var next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      write(STORE.theme, next);
      applyTheme(next);
    });
  });

  /* ----------------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------------- */
  var menu = $("#mobile-menu");
  var menuOpen = $("[data-menu-open]");
  var menuClose = $("[data-menu-close]");
  var lastFocus = null;
  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.style.overflow = "hidden";
    if (menuClose) menuClose.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  on(menuOpen, "click", openMenu);
  on(menuClose, "click", closeMenu);
  $$("#mobile-menu a").forEach(function (a) { on(a, "click", closeMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu && !menu.hidden) closeMenu();
  });

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  var revealItems = $$(".reveal");
  if (revealItems.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      revealItems.forEach(function (el) { io.observe(el); });
    } else {
      revealItems.forEach(function (el) { el.classList.add("is-in"); });
    }
  }

  /* ----------------------------------------------------------------------
     Progress
     ---------------------------------------------------------------------- */
  function isDone(id) { return read(STORE.done(id), "") === "1"; }
  function setDone(id, value) { write(STORE.done(id), value ? "1" : "0"); }
  function moduleStats(moduleId) {
    var modules = window.SDM13_MODULES || [];
    var mod = modules.filter(function (m) { return m.id === moduleId; })[0];
    if (!mod) return { done: 0, total: 0, pct: 0 };
    var done = mod.lessons.filter(isDone).length;
    return { done: done, total: mod.lessons.length, pct: mod.lessons.length ? Math.round((done / mod.lessons.length) * 100) : 0 };
  }
  function renderProgress() {
    $$("[data-progress-module]").forEach(function (el) {
      var id = el.getAttribute("data-progress-module");
      var stats = moduleStats(id);
      var label = $("[data-progress-label]", el);
      if (label) label.textContent = stats.done + " / " + stats.total;
      var fill = $(".bar i", el) || (el.classList.contains("bar") ? $("i", el) : null);
      if (fill) fill.style.width = stats.pct + "%";
      var text = $("[data-progress-text]", el);
      if (text) text.textContent = stats.pct + "%";
    });
    $$("[data-progress-lesson-list]").forEach(function (el) {
      var moduleId = el.getAttribute("data-progress-lesson-list");
      var modules = window.SDM13_MODULES || [];
      var mod = modules.filter(function (m) { return m.id === moduleId; })[0];
      if (!mod) return;
      $$("[data-lesson-row]", el).forEach(function (row) {
        var id = row.getAttribute("data-lesson-row");
        var done = isDone(id);
        row.classList.toggle("is-done", done);
        var state = $(".lesson-row__state", row);
        if (state) {
          state.classList.toggle("is-done", done);
          state.textContent = done ? "مكتمل" : "غير مكتمل";
        }
      });
    });
  }
  renderProgress();

  /* Lesson completion toggle */
  var doneBtn = $("[data-done-lesson]");
  if (doneBtn) {
    var lessonId = doneBtn.getAttribute("data-done-lesson");
    function paintDone() {
      var done = isDone(lessonId);
      doneBtn.setAttribute("aria-pressed", done ? "true" : "false");
      var label = $("[data-done-label]", doneBtn);
      if (label) label.textContent = done ? "تم إكمال الدرس" : "أكملت هذا الدرس";
    }
    paintDone();
    on(doneBtn, "click", function () {
      var next = !isDone(lessonId);
      setDone(lessonId, next);
      paintDone();
      renderProgress();
    });
  }

  /* ----------------------------------------------------------------------
     Quiz
     ---------------------------------------------------------------------- */
  $$(".quiz").forEach(function (quiz) {
    var questions = $$(".quiz-q", quiz);
    var scoreEl = $("[data-quiz-score]", quiz);
    var total = questions.length;

    function updateScore() {
      var correct = 0;
      questions.forEach(function (q) {
        if (q.getAttribute("data-answered") === "correct") correct += 1;
      });
      if (scoreEl) {
        scoreEl.innerHTML = "النتيجة: <strong>" + correct + "</strong> من " + total;
      }
    }

    questions.forEach(function (q, qIndex) {
      var options = $$(".quiz-option", q);
      var feedback = $(".quiz-feedback", q);
      options.forEach(function (option) {
        on(option, "click", function () {
          if (q.getAttribute("data-answered")) return;
          var correct = option.getAttribute("data-correct") === "true";
          q.setAttribute("data-answered", correct ? "correct" : "wrong");
          options.forEach(function (o) {
            o.disabled = true;
            if (o.getAttribute("data-correct") === "true") o.classList.add("is-correct");
          });
          if (!correct) option.classList.add("is-wrong");
          if (feedback) {
            feedback.classList.add("is-visible");
            feedback.innerHTML = "<strong>" + (correct ? "إجابة صحيحة. " : "إجابة غير صحيحة. ") + "</strong>" +
              escapeHtml(feedback.getAttribute("data-explain") || "");
          }
          updateScore();
        });
      });
    });

    var reset = $("[data-quiz-reset]", quiz);
    on(reset, "click", function () {
      questions.forEach(function (q) {
        q.removeAttribute("data-answered");
        $$(".quiz-option", q).forEach(function (o) {
          o.disabled = false;
          o.classList.remove("is-correct", "is-wrong");
        });
        var feedback = $(".quiz-feedback", q);
        if (feedback) feedback.classList.remove("is-visible");
      });
      updateScore();
      if (reset.blur) reset.blur();
    });

    updateScore();
  });

  /* ----------------------------------------------------------------------
     Lesson table of contents active state
     ---------------------------------------------------------------------- */
  var tocLinks = $$(".lesson-toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var sections = tocLinks.map(function (a) {
      var id = a.getAttribute("href").slice(1);
      return document.getElementById(id);
    }).filter(Boolean);
    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.removeAttribute("aria-current");
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
        });
      });
    }, { rootMargin: "-18% 0px -66% 0px", threshold: 0 });
    sections.forEach(function (s) { tocObserver.observe(s); });
  }

  /* ----------------------------------------------------------------------
     Search
     ---------------------------------------------------------------------- */
  var searchInput = $("#search-input");
  if (searchInput) {
    var resultsEl = $("#search-results");
    var statusEl = $("#search-status");
    var chips = $$("[data-search-filter]");
    var activeFilter = "all";
    var index = window.SDM13_SEARCH || [];

    function normalize(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        .replace(/[أإآا]/g, "ا")
        .replace(/[ىي]/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[ؤئ]/g, "ء")
        .replace(/\s+/g, " ")
        .trim();
    }

    function search(query) {
      var q = normalize(query);
      var filtered = index.filter(function (item) {
        if (activeFilter !== "all" && item.module !== activeFilter) return false;
        if (!q) return true;
        return normalize(item.title + " " + item.intro + " " + (item.terms || []).join(" ") + " " + item.moduleTitle).indexOf(q) !== -1;
      });
      return filtered.slice(0, 40);
    }

    function render() {
      var query = searchInput.value;
      var items = search(query);
      if (statusEl) {
        statusEl.textContent = query.trim()
          ? "تم العثور على " + items.length + (items.length === 1 ? " نتيجة" : " نتيجة") + "."
          : "أحدث الدروس والوحدات. اكتب كلمة للبحث في العناوين والمقدمات والمصطلحات.";
      }
      if (!resultsEl) return;
      if (!items.length) {
        resultsEl.innerHTML = '<div class="search-empty">لا توجد نتائج مطابقة. جرّب كلمة أخرى أو أزل التصفية.</div>';
        return;
      }
      resultsEl.innerHTML = items.map(function (item) {
        return '<a class="search-result" href="' + escapeHtml(item.url) + '">' +
          '<span class="search-result__meta"><span class="pill pill--accent">' + escapeHtml(item.moduleTitle) + '</span>' +
          '<span>الدرس ' + escapeHtml(item.number) + '</span><span>' + escapeHtml(item.duration) + '</span></span>' +
          '<strong class="search-result__title">' + escapeHtml(item.title) + '</strong>' +
          '<span class="search-result__excerpt">' + escapeHtml(item.intro) + '</span></a>';
      }).join("");
    }

    chips.forEach(function (chip) {
      on(chip, "click", function () {
        activeFilter = chip.getAttribute("data-search-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        render();
      });
    });
    on(searchInput, "input", render);

    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) searchInput.value = params.get("q");
    render();
  }

  /* ----------------------------------------------------------------------
     Contact form (client-side validation + WhatsApp handoff)
     ---------------------------------------------------------------------- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#form-status");
    var fields = {
      name: $("#field-name"),
      contact: $("#field-contact"),
      program: $("#field-program"),
      message: $("#field-message")
    };

    function setError(field, message) {
      if (!field) return false;
      var wrap = field.closest(".field");
      var error = wrap ? $(".field__error", wrap) : null;
      if (wrap) wrap.classList.toggle("has-error", Boolean(message));
      if (error) error.textContent = message || "";
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
      return !message;
    }

    function validate() {
      var ok = true;
      var name = fields.name ? fields.name.value.trim() : "";
      var contact = fields.contact ? fields.contact.value.trim() : "";
      var message = fields.message ? fields.message.value.trim() : "";
      ok = setError(fields.name, name.length < 2 ? "يرجى كتابة الاسم الكامل." : "") && ok;
      var looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
      var looksPhone = /^[+0-9\s().-]{7,20}$/.test(contact);
      ok = setError(fields.contact, !contact ? "يرجى إضافة وسيلة تواصل." : (!looksEmail && !looksPhone ? "أدخل رقم هاتف صحيحًا أو بريدًا إلكترونيًا." : "")) && ok;
      ok = setError(fields.message, message.length < 10 ? "اكتب رسالة من 10 أحرف على الأقل." : "") && ok;
      return ok;
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field) return;
      on(field, "blur", validate);
      on(field, "input", function () {
        var wrap = field.closest(".field");
        if (wrap && wrap.classList.contains("has-error")) validate();
      });
    });

    on(form, "submit", function (e) {
      e.preventDefault();
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }
      if (!validate()) {
        var firstInvalid = $(".field.has-error input, .field.has-error select, .field.has-error textarea", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var name = fields.name.value.trim();
      var contact = fields.contact.value.trim();
      var program = fields.program ? fields.program.value : "غير محدد";
      var message = fields.message.value.trim();
      var lines = [
        "مرحبًا SDM13 ACADEMY،",
        "",
        "الاسم: " + name,
        "وسيلة التواصل: " + contact,
        "البرنامج المهتم به: " + program,
        "",
        message
      ];
      var url = "https://wa.me/212706868909?text=" + encodeURIComponent(lines.join("\n"));
      var win = window.open(url, "_blank", "noopener");
      if (status) {
        status.className = "form-status is-visible is-success";
        status.innerHTML = win
          ? "تم تجهيز رسالتك في واتساب. أرسلها من التطبيق لإكمال التواصل. لا يتم تخزين بياناتك على هذا الموقع."
          : "تعذّر فتح واتساب تلقائيًا. يمكنك التواصل مباشرة على الرقم <strong>+212 706 868 909</strong>.";
      }
    });
  }
})();

// Analytiq — UI prototype behaviours.
// Everything here is client-side only; the real build will POST to server endpoints
// that enforce authorization, tenant isolation and validation.
(function () {
  "use strict";

  const nx = (window.nx = window.nx || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Toasts ----------
  nx.toast = function (message, variant = "success") {
    const host = $("#nxToasts");
    if (!host) return;
    const icons = { success: "bi-check-circle-fill text-success", info: "bi-info-circle-fill text-primary", warning: "bi-exclamation-triangle-fill text-warning", danger: "bi-x-circle-fill text-danger" };
    const el = document.createElement("div");
    el.className = "toast align-items-center bg-white";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `<div class="d-flex"><div class="toast-body d-flex gap-2 align-items-start"><i class="bi ${icons[variant] || icons.info}"></i><span></span></div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
    el.querySelector("span").textContent = message;
    host.appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 4200 });
    el.addEventListener("hidden.bs.toast", () => el.remove());
    t.show();
  };

  // ---------- Confirm dialog ----------
  // <button data-confirm="Message" data-confirm-title="Title" data-confirm-ok="Delete" data-confirm-variant="danger" data-toast="...">
  nx.confirm = function ({ title = "Are you sure?", message = "", ok = "Confirm", variant = "primary", reason = false }) {
    return new Promise((resolve) => {
      const modalEl = $("#nxConfirm");
      $(".modal-title", modalEl).textContent = title;
      $("[data-confirm-message]", modalEl).textContent = message;
      const okBtn = $("[data-confirm-ok]", modalEl);
      okBtn.textContent = ok;
      okBtn.className = `btn btn-${variant}`;
      const reasonWrap = $("[data-confirm-reason]", modalEl);
      const reasonInput = $("textarea", reasonWrap);
      reasonWrap.hidden = !reason;
      reasonInput.value = "";
      reasonInput.classList.remove("is-invalid");
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      let confirmed = false;
      const onOk = () => {
        if (reason && !reasonInput.value.trim()) { reasonInput.classList.add("is-invalid"); reasonInput.focus(); return; }
        confirmed = true;
        modal.hide();
      };
      okBtn.onclick = onOk;
      modalEl.addEventListener("hidden.bs.modal", () => resolve(confirmed ? { reason: reasonInput.value.trim() } : null), { once: true });
      modal.show();
      if (reason) setTimeout(() => reasonInput.focus(), 300);
    });
  };

  document.addEventListener("click", async (e) => {
    const trigger = e.target.closest("[data-confirm]");
    if (trigger) {
      e.preventDefault();
      const result = await nx.confirm({
        title: trigger.dataset.confirmTitle,
        message: trigger.dataset.confirm,
        ok: trigger.dataset.confirmOk,
        variant: trigger.dataset.confirmVariant,
        reason: trigger.hasAttribute("data-confirm-reason"),
      });
      if (!result) return;
      if (trigger.dataset.toast) nx.toast(trigger.dataset.toast, trigger.dataset.toastVariant);
      const form = trigger.closest("form");
      if (trigger.type === "submit" && form) form.submit();
      else if (trigger.tagName === "A" && trigger.href && !trigger.href.endsWith("#")) window.location = trigger.href;
      trigger.dispatchEvent(new CustomEvent("nx:confirmed", { bubbles: true, detail: result }));
      return;
    }
    const toastOnly = e.target.closest("[data-toast]:not([data-confirm])");
    if (toastOnly) {
      if (toastOnly.tagName === "A" && toastOnly.getAttribute("href") === "#") e.preventDefault();
      nx.toast(toastOnly.dataset.toast, toastOnly.dataset.toastVariant);
    }
  });

  // ---------- Sidebar (mobile) ----------
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-sidebar-toggle]")) $(".nx-app")?.classList.toggle("nx-sidebar-open");
    if (e.target.closest(".nx-sidebar-backdrop")) $(".nx-app")?.classList.remove("nx-sidebar-open");
  });

  // ---------- Keyboard: "/" focuses global search ----------
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      const s = $("#nxGlobalSearch");
      if (s) { e.preventDefault(); s.focus(); }
    }
  });

  // ---------- Filterable / sortable tables ----------
  // Container: [data-filter-table]; controls: [data-filter="search"], [data-filter-key="stage"], [data-filter-min="score"]
  // Rows: <tr data-row data-search="..." data-stage="..." data-score="72">
  function initFilterTable(root) {
    const rows = $$("tbody tr[data-row]", root);
    const empty = $("tbody tr.nx-table-empty", root);
    const counter = $("[data-filter-count]", root);
    const controls = $$("[data-filter],[data-filter-key],[data-filter-min]", root);

    function apply() {
      const q = ($("[data-filter='search']", root)?.value || "").trim().toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        let show = !q || (row.dataset.search || row.textContent).toLowerCase().includes(q);
        $$("[data-filter-key]", root).forEach((sel) => {
          const v = sel.value;
          if (!v) return;
          const values = (row.dataset[sel.dataset.filterKey] || "").split("|");
          if (!values.includes(v)) show = false;
        });
        $$("[data-filter-min]", root).forEach((sel) => {
          const min = parseFloat(sel.value);
          if (isNaN(min)) return;
          const val = parseFloat(row.dataset[sel.dataset.filterMin]);
          if (isNaN(val) || val < min) show = false;
        });
        row.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
      if (counter) counter.textContent = visible;
    }

    controls.forEach((c) => c.addEventListener(c.tagName === "SELECT" ? "change" : "input", apply));
    $("[data-filter-reset]", root)?.addEventListener("click", () => {
      controls.forEach((c) => (c.value = ""));
      apply();
    });

    // Sorting
    $$("th[data-sort]", root).forEach((th) => {
      th.classList.add("nx-sortable");
      th.tabIndex = 0;
      const sort = () => {
        const key = th.dataset.sort;
        const dir = th.getAttribute("aria-sort") === "descending" ? "ascending" : "descending";
        $$("th[data-sort]", root).forEach((o) => o.removeAttribute("aria-sort"));
        th.setAttribute("aria-sort", dir);
        const tbody = rows[0]?.parentElement;
        if (!tbody) return;
        rows
          .slice()
          .sort((a, b) => {
            const av = a.dataset[key] ?? "", bv = b.dataset[key] ?? "";
            const an = parseFloat(av), bn = parseFloat(bv);
            const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
            return dir === "ascending" ? cmp : -cmp;
          })
          .forEach((r) => tbody.insertBefore(r, empty || null));
      };
      th.addEventListener("click", sort);
      th.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sort(); } });
    });

    // Pre-fill search from ?q=
    const q = new URLSearchParams(location.search).get("q");
    const search = $("[data-filter='search']", root);
    if (q && search) search.value = q;
    apply();
  }
  $$("[data-filter-table]").forEach(initFilterTable);

  // ---------- Bulk selection ----------
  $$("[data-bulk]").forEach((root) => {
    const all = $("[data-check-all]", root);
    const bar = $("[data-bulk-bar]", root);
    const countEl = $("[data-bulk-count]", root);
    const boxes = () => $$("[data-check-row]", root).filter((b) => !b.closest("tr")?.hidden);
    const selected = () => $$("[data-check-row]:checked", root);
    function refresh() {
      const n = selected().length;
      bar?.classList.toggle("show", n > 0);
      if (countEl) countEl.textContent = n;
      if (all) all.checked = n > 0 && n === boxes().length;
      $$("[data-requires-selection]", root).forEach((b) => {
        const max = parseInt(b.dataset.max || "99", 10), min = parseInt(b.dataset.min || "1", 10);
        b.disabled = n < min || n > max;
      });
    }
    all?.addEventListener("change", () => { boxes().forEach((b) => (b.checked = all.checked)); refresh(); });
    root.addEventListener("change", (e) => { if (e.target.matches("[data-check-row]")) refresh(); });
    $$("[data-compare-url]", root).forEach((btn) =>
      btn.addEventListener("click", () => {
        const ids = selected().map((b) => b.value).join(",");
        window.location = `${btn.dataset.compareUrl}?ids=${encodeURIComponent(ids)}`;
      })
    );
    root.addEventListener("nx:confirmed", (e) => {
      const btn = e.target.closest("[data-bulk-stage]");
      if (!btn) return;
      selected().forEach((b) => {
        const badge = b.closest("tr")?.querySelector("[data-stage-badge]");
        if (badge) { badge.className = `nx-badge ${btn.dataset.badge}`; badge.textContent = btn.dataset.bulkStage; }
        b.checked = false;
      });
      refresh();
    });
    refresh();
  });

  // ---------- Stage actions on candidate profile ----------
  // <button data-stage-action="Shortlisted" data-badge="nx-badge-primary" data-needs-reason>
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-stage-action]");
    if (!btn) return;
    e.preventDefault();
    const stage = btn.dataset.stageAction;
    const result = await nx.confirm({
      title: `Move to “${stage}”?`,
      message: btn.dataset.message || "This change is recorded in the application history with your name and the time.",
      ok: `Move to ${stage}`,
      variant: btn.dataset.variant || "primary",
      reason: btn.hasAttribute("data-needs-reason"),
    });
    if (!result) return;
    $$("[data-stage-badge]").forEach((b) => { b.className = `nx-badge ${btn.dataset.badge}`; b.textContent = stage; });
    const tl = $("[data-history]");
    if (tl) {
      const li = document.createElement("li");
      li.dataset.kind = btn.dataset.kind || "primary";
      const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
      li.innerHTML = `<div class="nx-tl-title"></div><div class="nx-tl-meta"></div>`;
      li.querySelector(".nx-tl-title").textContent = stage;
      li.querySelector(".nx-tl-meta").textContent = `${now} · ${document.body.dataset.user || "You"}`;
      if (result.reason) {
        const r = document.createElement("div");
        r.className = "nx-tl-reason";
        r.textContent = `Reason: ${result.reason}`;
        li.appendChild(r);
      }
      tl.appendChild(li);
    }
    nx.toast(`Stage changed to ${stage}. (Prototype — not saved.)`);
  });

  // ---------- Notes ----------
  $$("[data-note-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ta = $("textarea", form);
      const text = ta.value.trim();
      if (!text) { ta.classList.add("is-invalid"); return; }
      ta.classList.remove("is-invalid");
      const list = $(form.dataset.noteForm);
      const item = document.createElement("div");
      item.className = "border rounded-3 p-3 mb-2 bg-white";
      item.innerHTML = `<div class="d-flex justify-content-between small mb-1"><strong></strong><span class="text-muted">just now</span></div><div class="small"></div>`;
      item.querySelector("strong").textContent = document.body.dataset.user || "You";
      item.querySelector(".small:last-child").textContent = text;
      list.prepend(item);
      ta.value = "";
      nx.toast("Note added (visible to your company's recruiters only).");
    });
  });

  // ---------- Tag input ----------
  $$("[data-tags]").forEach((wrap) => {
    const input = $("input[type=text]", wrap);
    const hidden = $("input[type=hidden]", wrap);
    const list = $(".nx-chips", wrap);
    const values = () => $$(".nx-chip", list).map((c) => c.dataset.value);
    const sync = () => (hidden.value = values().join(","));
    const add = (v) => {
      v = v.trim();
      if (!v || values().some((x) => x.toLowerCase() === v.toLowerCase())) return;
      const chip = document.createElement("span");
      chip.className = "nx-chip";
      chip.dataset.value = v;
      chip.innerHTML = `<span></span><button type="button" aria-label="Remove"><i class="bi bi-x"></i></button>`;
      chip.querySelector("span").textContent = v;
      list.appendChild(chip);
      sync();
    };
    (hidden.value || "").split(",").filter(Boolean).forEach(add);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input.value); input.value = ""; }
      if (e.key === "Backspace" && !input.value) { list.lastElementChild?.remove(); sync(); }
    });
    input.addEventListener("blur", () => { if (input.value) { add(input.value); input.value = ""; } });
    list.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { b.closest(".nx-chip").remove(); sync(); } });
    $$("[data-suggest]", wrap.parentElement).forEach((s) => s.addEventListener("click", () => add(s.dataset.suggest)));
  });

  // ---------- Scoring weights ----------
  $$("[data-weights]").forEach((group) => {
    const sliders = $$("input[type=range]", group);
    const total = $("[data-weights-total]", group);
    const warn = $("[data-weights-warn]", group);
    const update = () => {
      let sum = 0;
      sliders.forEach((s) => { sum += +s.value; $(`[data-weight-out='${s.name}']`, group).textContent = `${s.value}%`; });
      total.textContent = `${sum}%`;
      warn.hidden = sum === 100;
      total.classList.toggle("text-danger", sum !== 100);
    };
    sliders.forEach((s) => s.addEventListener("input", update));
    update();
  });

  // ---------- AI job description draft (prototype) ----------
  $$("[data-ai-draft]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const title = ($("#Title")?.value || "").trim();
      if (!title) { nx.toast("Enter a job title first so the draft has something to work from.", "warning"); $("#Title")?.focus(); return; }
      const target = $(btn.dataset.aiDraft);
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Drafting with local model…`;
      setTimeout(() => {
        const skills = ($("#RequiredSkills")?.value || "").split(",").filter(Boolean);
        target.value =
`We are looking for a ${title} to join our team.

About the role
You will work closely with product and engineering stakeholders to deliver reliable, well-tested work and contribute to how the team plans and ships.

What you will do
- Own features from design through release
- Collaborate on technical and product decisions
- Review work and share knowledge with the team

What we are looking for
${skills.length ? skills.map((s) => `- Hands-on experience with ${s}`).join("\n") : "- Relevant hands-on experience (add required skills to tailor this list)"}
- Clear written and verbal communication`;
        target.dispatchEvent(new Event("input"));
        $("[data-ai-draft-note]")?.removeAttribute("hidden");
        btn.disabled = false;
        btn.innerHTML = original;
        nx.toast("Draft inserted. Review and edit it — nothing is published automatically.", "info");
      }, 1100);
    });
  });

  // ---------- Resume upload (client-side checks; server re-validates content) ----------
  $$("[data-upload]").forEach((zone) => {
    const input = $("input[type=file]", zone);
    const label = $("[data-upload-label]", zone);
    const err = $("[data-upload-error]", zone.parentElement);
    const maxMb = parseFloat(zone.dataset.maxMb || "5");
    const allowed = (zone.dataset.accept || ".pdf,.docx").split(",");
    const validate = (file) => {
      if (!file) return "Please attach your resume.";
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (!allowed.includes(ext)) return `Only ${allowed.join(", ").toUpperCase()} files are accepted.`;
      if (file.size > maxMb * 1024 * 1024) return `File is larger than ${maxMb} MB.`;
      if (file.size === 0) return "The file is empty.";
      return null;
    };
    const show = () => {
      const f = input.files[0];
      const msg = f ? validate(f) : null;
      err.textContent = msg || "";
      err.hidden = !msg;
      zone.classList.toggle("border-danger", !!msg);
      label.innerHTML = f && !msg
        ? `<strong>${f.name.replace(/[<>&"]/g, "")}</strong><br><span class="text-muted small">${(f.size / 1024).toFixed(0)} KB · ready to upload</span>`
        : label.dataset.default;
    };
    label.dataset.default = label.innerHTML;
    zone.addEventListener("click", (e) => { if (e.target !== input) input.click(); });
    zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", show);
    ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("drag"); }));
    zone.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; show(); } });
    zone.closest("form")?.addEventListener("submit", (e) => {
      const msg = validate(input.files[0]);
      if (msg) { e.preventDefault(); err.textContent = msg; err.hidden = false; zone.classList.add("border-danger"); zone.focus(); }
    });
  });

  // ---------- Bootstrap-style client validation for forms marked .needs-validation ----------
  $$("form.needs-validation").forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!form.checkValidity()) { e.preventDefault(); e.stopPropagation(); form.querySelector(":invalid")?.focus(); }
      form.classList.add("was-validated");
    });
  });

  // ---------- Billing cycle toggle ----------
  $$("[data-cycle-toggle]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const annual = toggle.checked;
      $$("[data-price-monthly]").forEach((el) => (el.hidden = annual));
      $$("[data-price-annual]").forEach((el) => (el.hidden = !annual));
    });
  });

  // ---------- Skeleton → content swap (simulated load) ----------
  $$("[data-skeleton]").forEach((sk) => {
    const target = $(sk.dataset.skeleton);
    setTimeout(() => { sk.remove(); target?.removeAttribute("hidden"); }, 450);
  });

  // ---------- Toasts from server redirects ----------
  const pending = document.body.dataset.toast;
  if (pending) nx.toast(pending, document.body.dataset.toastVariant || "success");

  // ---------- Bootstrap tooltips ----------
  $$("[data-bs-toggle='tooltip']").forEach((el) => new bootstrap.Tooltip(el));
})();

/* Email links that work on NHS computers.
   Clicking any mailto: link opens a small chooser instead of the computer's email app,
   which on many NHS machines only asks you to pick or download an app.
   The chooser offers: copy the address, copy the prepared message (if the link has one),
   open it in Outlook on the web (NHSmail), open it in Gmail, or use your email app as before.
   Nothing is sent or stored. States: closed -> open -> copied -> open ... -> closed (dialog[data-state]).
   To use on a page: <script src="/assets/email.js" defer></script> before </body>. */
(function () {
  "use strict";
  if (window.__ciEmail) return; window.__ciEmail = true;

  var css = ".ci-mail{border:0;padding:0;margin:auto;max-width:min(440px,calc(100vw - 32px));width:100%;border-radius:12px;background:#fbf8f1;color:#13201a;box-shadow:0 24px 60px rgba(0,0,0,.35);font:16px/1.5 'Inter Tight',Arial,Helvetica,sans-serif}" +
    ".ci-mail::backdrop{background:rgba(12,18,15,.55)}" +
    ".ci-mail .in{padding:22px 20px 18px;position:relative}" +
    ".ci-mail h2{font:500 24px/1.15 Fraunces,Georgia,serif;margin:0 36px 6px 0;color:#13201a;letter-spacing:-.01em}" +
    ".ci-mail p{margin:0 0 12px;color:#4a4841}" +
    ".ci-mail .addr{display:block;font:600 18px/1.3 'Inter Tight',Arial,sans-serif;color:#13201a;background:#fff;border:1.5px solid #d9d1bf;border-radius:8px;padding:12px;margin:0 0 12px;-webkit-user-select:all;user-select:all;word-break:break-all}" +
    ".ci-mail button,.ci-mail a.opt{font:600 16px/1.2 'Inter Tight',Arial,sans-serif;display:block;width:100%;text-align:center;border-radius:8px;padding:14px 12px;margin:0 0 8px;cursor:pointer;text-decoration:none;box-sizing:border-box}" +
    ".ci-mail .copy{background:#1f5f3f;color:#fff;border:0}" +
    ".ci-mail .copy2{background:transparent;color:#1f5f3f;border:1.5px solid #1f5f3f}" +
    ".ci-mail .or{font-size:14px;color:#4a4841;margin:10px 0 8px}" +
    ".ci-mail a.opt{background:#fff;color:#13201a;border:1.5px solid #d9d1bf}" +
    ".ci-mail a.opt:hover,.ci-mail a.opt:focus-visible{border-color:#1f5f3f}" +
    ".ci-mail .x{position:absolute;top:10px;right:10px;width:40px;height:40px;padding:0;margin:0;border:0;background:transparent;color:#4a4841;font-size:26px;line-height:40px}" +
    ".ci-mail :focus-visible{outline:3px solid #b5651a;outline-offset:2px}" +
    ".ci-mail .ok{color:#1f5f3f;font-weight:600;min-height:1.5em;margin:4px 0 0;text-align:center}";

  var dlg = null, current = null;

  function parse(href) {
    var raw = href.replace(/^mailto:/i, ""), q = raw.indexOf("?"), to = decodeURIComponent(q < 0 ? raw : raw.slice(0, q));
    var params = {};
    if (q >= 0) raw.slice(q + 1).replace(/&amp;/g, "&").split("&").forEach(function (kv) {
      var i = kv.indexOf("="); if (i < 0) return;
      try { params[kv.slice(0, i).toLowerCase()] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, "%20")); } catch (e) {}
    });
    return {to: to, subject: params.subject || "", body: params.body || "", href: href};
  }
  function enc(s) { return encodeURIComponent(s); }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, no) {
      var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      (dlg || document.body).appendChild(t); t.select();
      var done = false; try { done = document.execCommand("copy"); } catch (e) {}
      t.remove(); done ? ok() : no();
    });
  }

  function build() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    dlg = document.createElement("dialog"); dlg.className = "ci-mail"; dlg.setAttribute("aria-labelledby", "ci-mail-h"); dlg.dataset.state = "closed";
    dlg.innerHTML = '<div class="in"><button type="button" class="x" aria-label="Close">×</button>' +
      '<h2 id="ci-mail-h">Email us</h2><p>Copy our address into any email, or open it straight in your inbox.</p>' +
      '<span class="addr" id="ci-mail-a"></span>' +
      '<button type="button" class="copy" data-copy="addr">Copy email address</button>' +
      '<button type="button" class="copy2" data-copy="msg" hidden>Copy the suggested message too</button>' +
      '<p class="ok" id="ci-mail-ok" role="status" aria-live="polite"></p>' +
      '<p class="or">Or open a new email in:</p>' +
      '<a class="opt" id="ci-mail-o" target="_blank" rel="noopener noreferrer">NHSmail or Outlook on the web</a>' +
      '<a class="opt" id="ci-mail-g" target="_blank" rel="noopener noreferrer">Gmail</a>' +
      '<a class="opt" id="ci-mail-m">Your computer’s email app</a></div>';
    document.body.appendChild(dlg);
    dlg.querySelector(".x").addEventListener("click", close);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); }); // a tap outside the box closes it
    dlg.addEventListener("close", function () { dlg.dataset.state = "closed"; if (current && current.from) try { current.from.focus(); } catch (e) {} });
    dlg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]"); if (!b || !current) return;
      var msg = b.dataset.copy === "addr" ? current.to : (current.subject ? "Subject: " + current.subject + "\n\n" : "") + current.body;
      var ok = document.getElementById("ci-mail-ok");
      copyText(msg).then(function () {
        dlg.dataset.state = "copied";
        ok.textContent = b.dataset.copy === "addr" ? "Copied. Paste it into the To box of a new email." : "Message copied. Paste it into your email.";
      }, function () {
        ok.textContent = "Couldn’t copy automatically. Select the address above and press Ctrl+C.";
      });
    });
    dlg.querySelectorAll("a.opt").forEach(function (a) { a.addEventListener("click", function () { setTimeout(close, 50); }); });
  }

  function open(link) {
    if (!dlg) build();
    var m = parse(link.getAttribute("href")); m.from = link; current = m;
    document.getElementById("ci-mail-a").textContent = m.to;
    document.getElementById("ci-mail-ok").textContent = "";
    dlg.querySelector('[data-copy="msg"]').hidden = !m.body;
    var qs = (m.subject ? "&subject=" + enc(m.subject) : "") + (m.body ? "&body=" + enc(m.body) : "");
    document.getElementById("ci-mail-o").href = "https://outlook.office.com/mail/deeplink/compose?to=" + enc(m.to) + qs;
    document.getElementById("ci-mail-g").href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + enc(m.to) + (m.subject ? "&su=" + enc(m.subject) : "") + (m.body ? "&body=" + enc(m.body) : "");
    document.getElementById("ci-mail-m").href = m.href;
    if (typeof dlg.showModal === "function") dlg.showModal(); else { dlg.setAttribute("open", ""); }
    dlg.dataset.state = "open";
    dlg.querySelector(".copy").focus();
  }
  function close() { if (!dlg) return; if (typeof dlg.close === "function" && dlg.open) dlg.close(); else { dlg.removeAttribute("open"); dlg.dataset.state = "closed"; } }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a || (dlg && dlg.contains(a))) return;
    e.preventDefault(); open(a);
  });
})();

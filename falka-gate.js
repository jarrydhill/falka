/* =========================================================
   FALKA pre-launch gate
   Runs in <head>. If the visitor hasn't unlocked, injects a
   full-screen Coming Soon holding screen and hides body
   scroll. Correct password sets localStorage flag and reveals.

   Change the password by computing a new SHA-256:
     printf "newpassword" | sha256sum
   and replacing PASSWORD_HASH below.

   Current password: falka2026
   ========================================================= */
(function () {
    'use strict';

    var PASSWORD_HASH = '5c0959d9d2f6ceb12012d471f098a28fadc63745d1b12a3987dc2e4284fa915e';
    var KEY = 'falka_unlocked';

    // Allow ?unlock=<password> in URL for sharing a direct link,
    // and ?lock to force the gate back (demo / testing).
    try {
        var params = new URLSearchParams(location.search);
        if (params.has('lock')) {
            try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
            params.delete('lock');
            history.replaceState({}, '', location.pathname + (params.toString() ? '?' + params.toString() : '') + location.hash);
        }
        var qp = params.get('unlock');
        if (qp) {
            sha256(qp).then(function (h) {
                if (h === PASSWORD_HASH) {
                    localStorage.setItem(KEY, '1');
                    params.delete('unlock');
                    var clean = location.pathname + (params.toString() ? '?' + params.toString() : '') + location.hash;
                    history.replaceState({}, '', clean);
                }
                if (!isUnlocked()) renderGate();
            });
            return;
        }
    } catch (e) { /* old browser, fall through */ }

    if (isUnlocked()) return;

    // Block paint of the page underneath until DOM is ready and gate is in place.
    // We can't easily inject into <body> before it parses, so we write a style
    // that hides everything except #falka-gate.
    var style = document.createElement('style');
    style.id = 'falka-gate-style';
    style.textContent = [
        'html, body { overflow: hidden !important; }',
        'body > *:not(#falka-gate) { visibility: hidden !important; }'
    ].join('\n');
    document.documentElement.appendChild(style);

    document.addEventListener('DOMContentLoaded', renderGate);

    function isUnlocked() {
        try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
    }

    function renderGate() {
        if (document.getElementById('falka-gate')) return;
        if (isUnlocked()) { reveal(); return; }

        var wrap = document.createElement('div');
        wrap.id = 'falka-gate';
        wrap.innerHTML = gateHTML();
        document.body.appendChild(wrap);

        injectGateStyles();

        var form = document.getElementById('falka-gate-form');
        form.addEventListener('submit', onSubmit);

        // Focus password input after a tick
        setTimeout(function () {
            var inp = document.getElementById('falka-gate-password');
            if (inp) inp.focus();
        }, 200);
    }

    function gateHTML() {
        return [
            '<div class="fg-bg" aria-hidden="true"></div>',
            '<div class="fg-overlay" aria-hidden="true"></div>',
            '<div class="fg-inner">',
            '  <div class="fg-mark" aria-label="FALKA Yachtworks">',
            '    <span class="fg-name">FALKA</span>',
            '    <span class="fg-rule"></span>',
            '    <span class="fg-sub">Yachtworks</span>',
            '  </div>',
            '  <p class="fg-eyebrow">Coming Soon</p>',
            '  <form id="falka-gate-form" autocomplete="off" novalidate>',
            '    <label for="falka-gate-password" class="fg-label">Access Code</label>',
            '    <div class="fg-input-row">',
            '      <input id="falka-gate-password" name="password" type="password" autocomplete="current-password" spellcheck="false" required>',
            '      <button type="submit" class="fg-submit" aria-label="Enter">',
            '        <span class="fg-arrow"></span>',
            '      </button>',
            '    </div>',
            '    <p id="falka-gate-error" class="fg-error" role="alert" aria-live="polite"></p>',
            '  </form>',
            '  <p class="fg-contact"><a href="mailto:hello@falka.com.au">hello@falka.com.au</a></p>',
            '</div>'
        ].join('');
    }

    function injectGateStyles() {
        if (document.getElementById('falka-gate-injected')) return;
        var s = document.createElement('style');
        s.id = 'falka-gate-injected';
        s.textContent = gateCSS();
        document.head.appendChild(s);
    }

    function gateCSS() {
        return [
            '#falka-gate {',
            '    position: fixed; inset: 0; z-index: 99999;',
            '    visibility: visible !important;',
            '    color: #fff;',
            '    font-family: "Archivo", system-ui, -apple-system, "Segoe UI", sans-serif;',
            '    display: flex; align-items: center; justify-content: center;',
            '    padding: 2rem 1.5rem;',
            '    -webkit-font-smoothing: antialiased;',
            '}',
            '#falka-gate .fg-bg {',
            '    position: absolute; inset: 0;',
            '    background: #0E222C;',  /* harbour-900 — flat, no decorative gradients */
            '}',
            '#falka-gate .fg-overlay { display: none; }',
            '#falka-gate .fg-inner {',
            '    position: relative; z-index: 2;',
            '    width: 100%; max-width: 560px;',
            '    text-align: center;',
            '    animation: fg-fadein 1.1s cubic-bezier(.22,.61,.36,1) both;',
            '}',
            '@keyframes fg-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }',
            '#falka-gate .fg-mark {',
            '    display: inline-flex; flex-direction: column; align-items: center;',
            '    gap: 6px; line-height: 1; margin-bottom: 3rem;',
            '    font-family: "Jost", "Avenir Next", "Avenir", system-ui, sans-serif;',
            '}',
            '#falka-gate .fg-name {',
            '    font-weight: 200; font-size: 2.6rem;',
            '    letter-spacing: 0.42em; text-indent: 0.42em;',
            '    text-transform: uppercase;',
            '}',
            '#falka-gate .fg-rule {',
            '    display: block; width: 64%; height: 1px;',
            '    background: currentColor; opacity: 0.6;',
            '}',
            '#falka-gate .fg-sub {',
            '    font-weight: 300; font-size: 0.78rem;',
            '    letter-spacing: 0.42em; text-indent: 0.42em;',
            '    text-transform: uppercase; opacity: 0.85;',
            '}',
            '#falka-gate .fg-eyebrow {',
            '    font-size: 12px; font-weight: 600;',
            '    letter-spacing: 0.18em; text-indent: 0.18em; text-transform: uppercase;',
            '    color: #DCC99A;',
            '    margin: 0 0 3rem;',
            '}',
            '#falka-gate .fg-headline {',
            '    font-family: "Cormorant Garamond", "Playfair Display", serif;',
            '    font-weight: 300; font-size: clamp(1.75rem, 4.5vw, 2.75rem);',
            '    line-height: 1.15; margin: 0 auto 1.25rem;',
            '    max-width: 22ch;',
            '}',
            '#falka-gate .fg-headline em {',
            '    font-style: italic; color: #d9bd85;',
            '}',
            '#falka-gate .fg-body {',
            '    font-size: 0.98rem; line-height: 1.7;',
            '    color: rgba(255,255,255,0.78);',
            '    margin: 0 auto 2.5rem; max-width: 44ch;',
            '}',
            '#falka-gate form { margin: 0 auto; max-width: 360px; }',
            '#falka-gate .fg-label {',
            '    display: block; text-align: left;',
            '    font-size: 0.62rem; font-weight: 500;',
            '    letter-spacing: 0.32em; text-transform: uppercase;',
            '    color: rgba(255,255,255,0.55);',
            '    margin-bottom: 0.5rem;',
            '}',
            '#falka-gate .fg-input-row {',
            '    display: flex; align-items: center;',
            '    border-bottom: 1px solid rgba(255,255,255,0.45);',
            '    transition: border-color 0.25s;',
            '}',
            '#falka-gate .fg-input-row:focus-within { border-bottom-color: #B89A57; }',
            '#falka-gate input {',
            '    flex: 1; background: transparent; border: 0;',
            '    color: #fff; font-family: inherit;',
            '    font-size: 1rem; padding: 0.65rem 0;',
            '    outline: none;',
            '    letter-spacing: 0.06em;',
            '}',
            '#falka-gate input::placeholder { color: rgba(255,255,255,0.4); }',
            '#falka-gate .fg-submit {',
            '    background: none; border: 0; cursor: pointer;',
            '    width: 36px; height: 36px;',
            '    display: inline-flex; align-items: center; justify-content: center;',
            '    color: rgba(255,255,255,0.85);',
            '    transition: color 0.2s, transform 0.2s;',
            '}',
            '#falka-gate .fg-submit:hover { color: #fff; transform: translateX(2px); }',
            '#falka-gate .fg-arrow {',
            '    display: inline-block; width: 18px; height: 1px;',
            '    background: currentColor; position: relative;',
            '}',
            '#falka-gate .fg-arrow::after {',
            '    content: ""; position: absolute; right: 0; top: 50%;',
            '    width: 8px; height: 8px;',
            '    border-top: 1px solid currentColor;',
            '    border-right: 1px solid currentColor;',
            '    transform: translateY(-50%) rotate(45deg);',
            '}',
            '#falka-gate .fg-error {',
            '    min-height: 1.2em; margin: 0.85rem 0 0;',
            '    font-size: 0.78rem; color: #f0a8a8;',
            '    letter-spacing: 0.04em;',
            '}',
            '#falka-gate .fg-contact {',
            '    margin: 3rem 0 0;',
            '    font-size: 0.78rem;',
            '    letter-spacing: 0.18em; text-transform: uppercase;',
            '    color: rgba(255,255,255,0.6);',
            '}',
            '#falka-gate .fg-contact a { color: inherit; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 2px; transition: border-color 0.2s, color 0.2s; }',
            '#falka-gate .fg-contact a:hover { color: #fff; border-bottom-color: #B89A57; }',
            '@media (max-width: 540px) {',
            '    #falka-gate .fg-name { font-size: 1.85rem; }',
            '}'
        ].join('\n');
    }

    function onSubmit(e) {
        e.preventDefault();
        var input = document.getElementById('falka-gate-password');
        var err = document.getElementById('falka-gate-error');
        var pw = (input.value || '').trim();
        if (!pw) { err.textContent = 'Enter the access code.'; return false; }
        err.textContent = '';

        sha256(pw).then(function (hash) {
            if (hash === PASSWORD_HASH) {
                try { localStorage.setItem(KEY, '1'); } catch (e) { /* private mode */ }
                reveal();
            } else {
                err.textContent = 'Incorrect. Try again.';
                input.value = '';
                input.focus();
            }
        }).catch(function () {
            err.textContent = 'Something went wrong. Refresh and try again.';
        });
        return false;
    }

    function reveal() {
        var gate = document.getElementById('falka-gate');
        var style = document.getElementById('falka-gate-style');
        var injected = document.getElementById('falka-gate-injected');
        if (gate) {
            gate.style.transition = 'opacity 0.5s ease';
            gate.style.opacity = '0';
            setTimeout(function () {
                if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
                if (style && style.parentNode) style.parentNode.removeChild(style);
                if (injected && injected.parentNode) injected.parentNode.removeChild(injected);
            }, 500);
        } else {
            if (style && style.parentNode) style.parentNode.removeChild(style);
        }
    }

    function sha256(str) {
        var enc = new TextEncoder().encode(str);
        return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
            return Array.from(new Uint8Array(buf))
                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                .join('');
        });
    }
})();

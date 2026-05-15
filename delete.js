// ==UserScript==
// @name            Discord DM Deleter
// @description     Delete all messages in a Discord channel or DM (Bulk deletion)
// @version         1.0.0
// @author          noydra
// @homepageURL     https://github.com/noydra/discord-dm-deleter
// @supportURL      https://github.com/noydra/discord-dm-deleter/issues
// @match           https://*.discord.com/app
// @match           https://*.discord.com/channels/*
// @match           https://*.discord.com/login
// @license         MIT
// @namespace       https://github.com/noydra/discord-dm-deleter
// @run-at          document-start
// @grant           unsafeWindow
// @grant           GM_addStyle
// ==/UserScript==
(function () {
	'use strict';

	const win = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

	const VERSION = '1.0.0';
	const HOME = 'https://github.com/noydra/discord-dm-deleter';
	const WIKI = 'https://github.com/noydra/discord-dm-deleter';
	const PREFIX = '[DM-DELETER]';

	const themeCss = `
:root {
  --ndr-bg: #1a1b26;
  --ndr-bg-2: #1f2032;
  --ndr-bg-3: #24263b;
  --ndr-surface: #2a2d44;
  --ndr-border: #3b3f5c;
  --ndr-accent: #7c5cff;
  --ndr-accent-2: #b388ff;
  --ndr-danger: #ff5577;
  --ndr-success: #4ade80;
  --ndr-warn: #fbbf24;
  --ndr-text: #e6e7ee;
  --ndr-text-dim: #9aa0b4;
  --ndr-text-muted: #6b7089;
  --ndr-shadow: 0 20px 60px rgba(0,0,0,.55), 0 6px 20px rgba(0,0,0,.35);
}

#ndr-app, #ndr-app * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }

#ndr-app {
  position: fixed; z-index: 100000;
  top: 70px; right: 24px;
  width: 820px; height: 78vh;
  min-width: 560px; min-height: 460px;
  max-width: 100vw; max-height: 100vh;
  background: var(--ndr-bg);
  color: var(--ndr-text);
  border: 1px solid var(--ndr-border);
  border-radius: 14px;
  box-shadow: var(--ndr-shadow);
  display: flex; flex-direction: column;
  overflow: hidden;
}

#ndr-app .ndr-header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, var(--ndr-bg-2) 0%, var(--ndr-bg-3) 100%);
  border-bottom: 1px solid var(--ndr-border);
  cursor: grab;
  user-select: none;
}
#ndr-app .ndr-header:active { cursor: grabbing; }
#ndr-app .ndr-logo {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--ndr-accent), var(--ndr-accent-2));
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 12px rgba(124,92,255,.4);
}
#ndr-app .ndr-title { display: flex; flex-direction: column; line-height: 1.2; }
#ndr-app .ndr-title strong { font-size: 15px; font-weight: 600; }
#ndr-app .ndr-title small { font-size: 11px; color: var(--ndr-text-dim); }
#ndr-app .ndr-spacer { flex: 1; }
#ndr-app .ndr-iconbtn {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--ndr-text-dim);
  cursor: pointer;
  transition: all .15s;
}
#ndr-app .ndr-iconbtn:hover { background: var(--ndr-surface); color: var(--ndr-text); border-color: var(--ndr-border); }

#ndr-app .ndr-body { flex: 1; display: flex; min-height: 0; }

#ndr-app .ndr-sidebar {
  width: 300px; min-width: 260px;
  background: var(--ndr-bg-2);
  border-right: 1px solid var(--ndr-border);
  overflow-y: auto;
  padding: 16px;
}
#ndr-app.ndr-collapsed .ndr-sidebar { display: none; }

#ndr-app .ndr-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

#ndr-app .ndr-section { margin-bottom: 18px; }
#ndr-app .ndr-section > summary {
  list-style: none;
  cursor: pointer;
  padding: 8px 10px;
  margin: 0 -8px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--ndr-accent-2);
  border-radius: 6px;
  transition: background .15s;
  display: flex; align-items: center; gap: 8px;
}
#ndr-app .ndr-section > summary::-webkit-details-marker { display: none; }
#ndr-app .ndr-section > summary::before {
  content: '▸';
  font-size: 10px;
  transition: transform .15s;
  color: var(--ndr-text-dim);
}
#ndr-app .ndr-section[open] > summary::before { transform: rotate(90deg); }
#ndr-app .ndr-section > summary:hover { background: var(--ndr-bg-3); }

#ndr-app .ndr-field { margin-bottom: 12px; }
#ndr-app .ndr-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--ndr-text-dim);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .4px;
}
#ndr-app .ndr-label a {
  float: right;
  color: var(--ndr-accent);
  text-decoration: none;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
#ndr-app .ndr-label a:hover { text-decoration: underline; }

#ndr-app .ndr-input-row { display: flex; gap: 6px; }
#ndr-app input[type="text"],
#ndr-app input[type="search"],
#ndr-app input[type="number"],
#ndr-app input[type="datetime-local"],
#ndr-app input[type="file"] {
  width: 100%;
  padding: 9px 12px;
  background: var(--ndr-bg-3);
  border: 1px solid var(--ndr-border);
  border-radius: 8px;
  color: var(--ndr-text);
  font-size: 13px;
  outline: none;
  transition: all .15s;
}
#ndr-app input[type="text"]:focus,
#ndr-app input[type="search"]:focus,
#ndr-app input[type="number"]:focus,
#ndr-app input[type="datetime-local"]:focus {
  border-color: var(--ndr-accent);
  box-shadow: 0 0 0 3px rgba(124,92,255,.18);
}
#ndr-app input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: var(--ndr-bg-3);
  border-radius: 3px;
  outline: none;
}
#ndr-app input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 16px; height: 16px;
  background: var(--ndr-accent);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid var(--ndr-bg);
}
#ndr-app .ndr-range-value {
  font-size: 11px;
  color: var(--ndr-text-dim);
  margin-top: 4px;
  text-align: right;
}

#ndr-app .ndr-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 14px;
  background: var(--ndr-surface);
  border: 1px solid var(--ndr-border);
  border-radius: 8px;
  color: var(--ndr-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
#ndr-app .ndr-btn:hover:not(:disabled) { background: var(--ndr-bg-3); border-color: var(--ndr-accent); }
#ndr-app .ndr-btn:disabled { opacity: .4; cursor: not-allowed; }
#ndr-app .ndr-btn-sm { padding: 7px 10px; font-size: 12px; }
#ndr-app .ndr-btn-primary {
  background: linear-gradient(135deg, var(--ndr-accent), var(--ndr-accent-2));
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(124,92,255,.3);
}
#ndr-app .ndr-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,92,255,.5); }
#ndr-app .ndr-btn-danger {
  background: linear-gradient(135deg, var(--ndr-danger), #ff7a99);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(255,85,119,.3);
}
#ndr-app .ndr-btn-danger:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,85,119,.5); }

#ndr-app .ndr-check {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px;
  color: var(--ndr-text);
  cursor: pointer;
  padding: 6px 0;
  user-select: none;
}
#ndr-app .ndr-check input[type="checkbox"] {
  width: 16px; height: 16px;
  accent-color: var(--ndr-accent);
  cursor: pointer;
}

#ndr-app .ndr-hint {
  font-size: 11px;
  color: var(--ndr-text-muted);
  line-height: 1.5;
  margin-top: 6px;
}

#ndr-app .ndr-divider {
  height: 1px;
  background: var(--ndr-border);
  margin: 14px 0;
}

#ndr-app .ndr-toolbar {
  padding: 12px 16px;
  background: var(--ndr-bg-2);
  border-bottom: 1px solid var(--ndr-border);
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}

#ndr-app .ndr-log {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  background: var(--ndr-bg);
  font-family: 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
#ndr-app .ndr-log .log { margin-bottom: 3px; }
#ndr-app .ndr-log .log-debug { color: var(--ndr-text-dim); }
#ndr-app .ndr-log .log-info { color: #60a5fa; }
#ndr-app .ndr-log .log-verb { color: var(--ndr-text-muted); }
#ndr-app .ndr-log .log-warn { color: var(--ndr-warn); }
#ndr-app .ndr-log .log-error { color: var(--ndr-danger); }
#ndr-app .ndr-log .log-success { color: var(--ndr-success); }
#ndr-app .ndr-log a { color: var(--ndr-accent-2); }

#ndr-app .ndr-welcome {
  background: linear-gradient(135deg, rgba(124,92,255,.12), rgba(179,136,255,.06));
  border: 1px solid rgba(124,92,255,.3);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: center;
}
#ndr-app .ndr-welcome h4 { margin: 0 0 6px; color: var(--ndr-accent-2); font-size: 14px; }
#ndr-app .ndr-welcome p { margin: 0; font-size: 12px; color: var(--ndr-text-dim); }

#ndr-app .ndr-footer {
  padding: 10px 16px;
  background: var(--ndr-bg-2);
  border-top: 1px solid var(--ndr-border);
  display: flex; align-items: center; gap: 12px;
  font-size: 11px;
  color: var(--ndr-text-dim);
}
#ndr-app .ndr-progress {
  flex: 1; height: 6px;
  background: var(--ndr-bg-3);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
#ndr-app .ndr-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--ndr-accent), var(--ndr-accent-2));
  width: 0;
  transition: width .3s;
  border-radius: 3px;
}

#ndr-app.ndr-redact .priv { display: none !important; }
#ndr-app.ndr-redact x:not(:active) {
  color: transparent !important;
  background: var(--ndr-surface) !important;
  border-radius: 3px;
  padding: 0 2px;
  cursor: default;
  user-select: none;
}
#ndr-app [priv] { -webkit-text-security: disc; }

#ndr-app .ndr-sidebar::-webkit-scrollbar,
#ndr-app .ndr-log::-webkit-scrollbar { width: 8px; height: 8px; }
#ndr-app .ndr-sidebar::-webkit-scrollbar-thumb,
#ndr-app .ndr-log::-webkit-scrollbar-thumb {
  background: var(--ndr-border);
  border-radius: 4px;
}
#ndr-app .ndr-sidebar::-webkit-scrollbar-thumb:hover,
#ndr-app .ndr-log::-webkit-scrollbar-thumb:hover { background: var(--ndr-accent); }

#ndr-app .ndr-resize {
  position: absolute;
  bottom: 0; right: 0;
  width: 16px; height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, var(--ndr-border) 50%, var(--ndr-border) 60%, transparent 60%, transparent 70%, var(--ndr-border) 70%, var(--ndr-border) 80%, transparent 80%);
}

#ndr-trigger {
  position: relative;
  width: 28px; height: 28px;
  margin: 0 6px;
  display: grid; place-items: center;
  cursor: pointer;
  color: var(--interactive-normal, #b9bbbe);
  border-radius: 6px;
  transition: all .15s;
}
#ndr-trigger:hover { color: var(--interactive-hover, #fff); background: rgba(255,255,255,.06); }
#ndr-trigger.running { color: #ff5577; }
#ndr-trigger.running::after {
  content: '';
  position: absolute;
  top: -2px; right: -2px;
  width: 8px; height: 8px;
  background: #ff5577;
  border-radius: 50%;
  box-shadow: 0 0 8px #ff5577;
  animation: ndr-pulse 1s infinite;
}
@keyframes ndr-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
`;

	const pickerCss = `
body.ndr-pick [data-list-id="chat-messages"] {
  box-shadow: inset 0 0 0 2px #7c5cff;
}
body.ndr-pick [id^="message-content-"]:hover {
  cursor: cell;
  background: rgba(124,92,255,.12) !important;
}
body.ndr-pick [id^="message-content-"]:hover::after {
  position: absolute;
  top: calc(50% - 12px);
  left: 6px;
  z-index: 99;
  padding: 4px 10px;
  background: #7c5cff;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  content: 'Select';
}
body.ndr-pick.before [id^="message-content-"]:hover::after { content: 'Before'; }
body.ndr-pick.after [id^="message-content-"]:hover::after { content: 'After'; }
`;

	const triggerHtml = `
<div id="ndr-trigger" tabindex="0" role="button" aria-label="DM Deleter" title="Discord DM Deleter">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
    <path d="M10 11v6M14 11v6"></path>
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
  </svg>
</div>
`;

	const appHtml = `
<div id="ndr-app" class="ndr-redact" style="display:none;">
  <div class="ndr-header">
    <div class="ndr-logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path>
      </svg>
    </div>
    <div class="ndr-title">
      <strong>Discord DM Deleter</strong>
      <small>v{{VERSION}} · by noydra</small>
    </div>
    <div class="ndr-spacer"></div>
    <button id="ndr-toggleSidebar" class="ndr-iconbtn" title="Toggle sidebar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <button id="ndr-hide" class="ndr-iconbtn" title="Close">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>

  <div class="ndr-body">
    <div class="ndr-sidebar">
      <details class="ndr-section" open>
        <summary>Target</summary>
        <div class="ndr-field">
          <label class="ndr-label">Author ID <a href="{{HOME}}" target="_blank">help</a></label>
          <div class="ndr-input-row">
            <input id="ndr-authorId" type="text" priv placeholder="Your user ID">
            <button id="ndr-getAuthor" class="ndr-btn ndr-btn-sm">me</button>
          </div>
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Server ID</label>
          <div class="ndr-input-row">
            <input id="ndr-guildId" type="text" priv placeholder="@me for DMs">
            <button id="ndr-getGuild" class="ndr-btn ndr-btn-sm">current</button>
          </div>
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Channel ID</label>
          <div class="ndr-input-row">
            <input id="ndr-channelId" type="text" priv placeholder="Channel / DM ID">
            <button id="ndr-getChannel" class="ndr-btn ndr-btn-sm">current</button>
          </div>
        </div>
        <label class="ndr-check"><input id="ndr-includeNsfw" type="checkbox"> Include NSFW channels</label>
      </details>

      <details class="ndr-section">
        <summary>Filters</summary>
        <div class="ndr-field">
          <label class="ndr-label">Contains text</label>
          <input id="ndr-search" type="text" priv placeholder="Optional keyword">
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Regex pattern</label>
          <input id="ndr-pattern" type="text" priv placeholder="e.g. ^hello.*">
        </div>
        <label class="ndr-check"><input id="ndr-hasLink" type="checkbox"> Has link</label>
        <label class="ndr-check"><input id="ndr-hasFile" type="checkbox"> Has file</label>
        <label class="ndr-check"><input id="ndr-includePinned" type="checkbox"> Include pinned</label>
      </details>

      <details class="ndr-section">
        <summary>Message Range</summary>
        <div class="ndr-field">
          <label class="ndr-label">After message</label>
          <div class="ndr-input-row">
            <input id="ndr-minId" type="text" priv placeholder="Message ID / date">
            <button id="ndr-pickAfter" class="ndr-btn ndr-btn-sm">pick</button>
          </div>
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Before message</label>
          <div class="ndr-input-row">
            <input id="ndr-maxId" type="text" priv placeholder="Message ID / date">
            <button id="ndr-pickBefore" class="ndr-btn ndr-btn-sm">pick</button>
          </div>
        </div>
        <div class="ndr-field">
          <label class="ndr-label">After date</label>
          <input id="ndr-minDate" type="datetime-local">
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Before date</label>
          <input id="ndr-maxDate" type="datetime-local">
        </div>
      </details>

      <details class="ndr-section">
        <summary>Import Archive</summary>
        <div class="ndr-field">
          <label class="ndr-label">index.json file</label>
          <input id="ndr-importJson" type="file" accept="application/json,.json">
        </div>
        <div class="ndr-hint">Load messages/index.json from your Discord data export to target every DM at once.</div>
      </details>

      <details class="ndr-section">
        <summary>Advanced</summary>
        <div class="ndr-field">
          <label class="ndr-label">Search delay</label>
          <input id="ndr-searchDelay" type="range" value="2000" step="100" min="100" max="30000">
          <div class="ndr-range-value" id="ndr-searchDelayValue">2000ms</div>
        </div>
        <div class="ndr-field">
          <label class="ndr-label">Delete delay</label>
          <input id="ndr-deleteDelay" type="range" value="1000" step="50" min="50" max="10000">
          <div class="ndr-range-value" id="ndr-deleteDelayValue">1000ms</div>
        </div>
        <div class="ndr-divider"></div>
        <div class="ndr-field">
          <label class="ndr-label">Auth Token</label>
          <div class="ndr-input-row">
            <input id="ndr-token" type="text" priv placeholder="Auto-detected">
            <button id="ndr-getToken" class="ndr-btn ndr-btn-sm">fill</button>
          </div>
        </div>
      </details>
    </div>

    <div class="ndr-main">
      <div class="ndr-toolbar">
        <button id="ndr-start" class="ndr-btn ndr-btn-danger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start Delete
        </button>
        <button id="ndr-stop" class="ndr-btn" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
          Stop
        </button>
        <button id="ndr-clear" class="ndr-btn">Clear log</button>
        <div class="ndr-spacer" style="flex:1"></div>
        <label class="ndr-check"><input id="ndr-redact" type="checkbox" checked> Streamer mode</label>
        <label class="ndr-check"><input id="ndr-autoScroll" type="checkbox" checked> Auto-scroll</label>
      </div>

      <div class="ndr-log" id="ndr-logArea">
        <div class="ndr-welcome">
          <h4>Discord DM Deleter v{{VERSION}}</h4>
          <p>Configure your target on the left, then click <strong>Start Delete</strong>.</p>
          <p style="margin-top:6px"><a href="{{HOME}}" target="_blank">github.com/noydra/discord-dm-deleter</a></p>
        </div>
      </div>

      <div class="ndr-footer">
        <span id="ndr-status">Ready</span>
        <div class="ndr-progress" id="ndr-progress" style="display:none;">
          <div class="ndr-progress-bar" id="ndr-progressBar"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="ndr-resize"></div>
</div>
`;

	const log = {
		debug() { return logFn ? logFn('debug', arguments) : console.debug.apply(console, arguments); },
		info() { return logFn ? logFn('info', arguments) : console.info.apply(console, arguments); },
		verb() { return logFn ? logFn('verb', arguments) : console.log.apply(console, arguments); },
		warn() { return logFn ? logFn('warn', arguments) : console.warn.apply(console, arguments); },
		error() { return logFn ? logFn('error', arguments) : console.error.apply(console, arguments); },
		success() { return logFn ? logFn('success', arguments) : console.info.apply(console, arguments); },
	};
	let logFn;
	const setLogFn = fn => logFn = fn;

	const wait = ms => new Promise(r => setTimeout(r, ms));
	const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
	const escapeHTML = h => String(h).replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
	const redact = s => `<x>${escapeHTML(s)}</x>`;
	const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
	const ask = msg => new Promise(r => setTimeout(() => r(window.confirm(msg)), 10));
	const toSnowflake = d => /:/.test(d) ? ((new Date(d).getTime() - 1420070400000) * Math.pow(2, 22)) : d;
	const interp = (str, obj) => str.replace(/\{\{([\w_]+)\}\}/g, (m, k) => obj[k] || m);

	class DeleterCore {
		constructor() {
			this.options = {
				authToken: null,
				authorId: null,
				guildId: null,
				channelId: null,
				minId: null,
				maxId: null,
				content: null,
				hasLink: null,
				hasFile: null,
				includeNsfw: null,
				includePinned: null,
				pattern: null,
				searchDelay: 2000,
				deleteDelay: 1000,
				maxAttempt: 2,
				askForConfirmation: true,
			};
			this.state = this._freshState();
			this.stats = this._freshStats();
			this.onStart = this.onProgress = this.onStop = undefined;
		}

		_freshState() {
			return {
				running: false,
				delCount: 0,
				failCount: 0,
				grandTotal: 0,
				offset: 0,
				iterations: 0,
				_searchResponse: null,
				_messagesToDelete: [],
				_skippedMessages: [],
			};
		}

		_freshStats() {
			return {
				startTime: new Date(),
				throttledCount: 0,
				throttledTotalTime: 0,
				lastPing: null,
				avgPing: 0,
				etr: 0,
			};
		}

		resetState() {
			this.state = this._freshState();
			this.options.askForConfirmation = true;
		}

		async runBatch(queue) {
			if (this.state.running) return log.error('Already running!');
			log.info(`Running batch with ${queue.length} jobs`);
			for (let i = 0; i < queue.length; i++) {
				const job = queue[i];
				log.info('Starting job', `(${i + 1}/${queue.length})`);
				this.options = { ...this.options, ...job };
				await this.run(true);
				if (!this.state.running) break;
				log.info('Job ended', `(${i + 1}/${queue.length})`);
				this.resetState();
				this.options.askForConfirmation = false;
				this.state.running = true;
			}
			log.info('Batch finished.');
			this.state.running = false;
		}

		async run(isJob = false) {
			if (this.state.running && !isJob) return log.error('Already running!');
			this.state.running = true;
			this.stats = this._freshStats();

			log.success(`Started at ${this.stats.startTime.toLocaleString()}`);
			log.debug(
				`authorId="${redact(this.options.authorId)}"`,
				`guildId="${redact(this.options.guildId)}"`,
				`channelId="${redact(this.options.channelId)}"`
			);

			if (this.onStart) this.onStart(this.state, this.stats);

			do {
				this.state.iterations++;
				log.verb('Fetching messages...');
				await this.search();
				await this.filterResponse();

				log.verb(
					`Total: ${this.state.grandTotal}`,
					`Page: ${this.state._searchResponse.messages.length}`,
					`To delete: ${this.state._messagesToDelete.length}`,
					`Skipped: ${this.state._skippedMessages.length}`,
					`Offset: ${this.state.offset}`
				);
				this.calcEtr();
				log.verb(`Estimated time remaining: ${msToHMS(this.stats.etr)}`);

				if (this.state._messagesToDelete.length > 0) {
					if (await this.confirm() === false) {
						this.state.running = false;
						break;
					}
					await this.deleteMessagesFromList();
				} else if (this.state._skippedMessages.length > 0) {
					const oldOffset = this.state.offset;
					this.state.offset += this.state._skippedMessages.length;
					log.verb(`Nothing deletable in this page. Skipping... (offset ${oldOffset} -> ${this.state.offset})`);
				} else {
					log.verb('No more messages found.');
					if (isJob) break;
					this.state.running = false;
				}

				log.verb(`Waiting ${(this.options.searchDelay / 1000).toFixed(2)}s before next page...`);
				await wait(this.options.searchDelay);
			} while (this.state.running);

			this.stats.endTime = new Date();
			log.success(`Ended at ${this.stats.endTime.toLocaleString()} (total ${msToHMS(this.stats.endTime - this.stats.startTime)})`);
			log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.`);
			if (this.onStop) this.onStop(this.state, this.stats);
		}

		stop() {
			this.state.running = false;
			if (this.onStop) this.onStop(this.state, this.stats);
		}

		calcEtr() {
			this.stats.etr = (this.options.searchDelay * Math.round(this.state.grandTotal / 25)) +
				((this.options.deleteDelay + (this.stats.avgPing || 0)) * this.state.grandTotal);
		}

		async confirm() {
			if (!this.options.askForConfirmation) return true;
			log.verb('Waiting for confirmation...');
			const preview = this.state._messagesToDelete
				.slice(0, 5)
				.map(m => `${m.author.username}: ${m.attachments.length ? '[ATTACHMENT]' : (m.content || '').slice(0, 80)}`)
				.join('\n');
			const answer = await ask(
				`Delete ~${this.state.grandTotal} messages?\n` +
				`Estimated time: ${msToHMS(this.stats.etr)}\n\n` +
				`--- Preview (first 5) ---\n${preview}`
			);
			if (!answer) { log.error('Aborted.'); return false; }
			log.verb('Confirmed.');
			this.options.askForConfirmation = false;
			return true;
		}

		async search() {
			const base = this.options.guildId === '@me'
				? `https://discord.com/api/v9/channels/${this.options.channelId}/messages/`
				: `https://discord.com/api/v9/guilds/${this.options.guildId}/messages/`;

			let resp;
			try {
				this.beforeRequest();
				resp = await fetch(base + 'search?' + queryString([
					['author_id', this.options.authorId || undefined],
					['channel_id', (this.options.guildId !== '@me' ? this.options.channelId : undefined) || undefined],
					['min_id', this.options.minId ? toSnowflake(this.options.minId) : undefined],
					['max_id', this.options.maxId ? toSnowflake(this.options.maxId) : undefined],
					['sort_by', 'timestamp'],
					['sort_order', 'desc'],
					['offset', this.state.offset],
					['has', this.options.hasLink ? 'link' : undefined],
					['has', this.options.hasFile ? 'file' : undefined],
					['content', this.options.content || undefined],
					['include_nsfw', this.options.includeNsfw ? true : undefined],
				]), {
					headers: { 'Authorization': this.options.authToken },
				});
				this.afterRequest();
			} catch (err) {
				this.state.running = false;
				log.error('Search request failed:', err);
				throw err;
			}

			if (resp.status === 202) {
				let w = (await resp.json()).retry_after * 1000;
				w = w || this.options.searchDelay;
				this.stats.throttledCount++;
				this.stats.throttledTotalTime += w;
				log.warn(`Channel not indexed yet. Waiting ${w}ms...`);
				await wait(w);
				return await this.search();
			}

			if (!resp.ok) {
				if (resp.status === 429) {
					let w = (await resp.json()).retry_after * 1000;
					w = w || this.options.searchDelay;
					this.stats.throttledCount++;
					this.stats.throttledTotalTime += w;
					this.options.searchDelay += w;
					log.warn(`Rate limited! Increased search delay to ${this.options.searchDelay}ms.`);
					await wait(w * 2);
					return await this.search();
				}
				this.state.running = false;
				log.error(`Search failed (${resp.status})`, await resp.json());
				throw resp;
			}

			const data = await resp.json();
			this.state._searchResponse = data;
			return data;
		}

		async filterResponse() {
			const data = this.state._searchResponse;
			if (data.total_results > this.state.grandTotal) this.state.grandTotal = data.total_results;

			const discovered = data.messages.map(convo => convo.find(m => m.hit === true));
			let toDelete = discovered.filter(m => m.type === 0 || (m.type >= 6 && m.type <= 21));
			toDelete = toDelete.filter(m => m.pinned ? this.options.includePinned : true);

			if (this.options.pattern) {
				try {
					const regex = new RegExp(this.options.pattern, 'i');
					toDelete = toDelete.filter(m => regex.test(m.content));
				} catch (e) {
					log.warn('Invalid regex pattern, ignored.', e);
				}
			}

			const skipped = discovered.filter(m => !toDelete.find(x => x.id === m.id));
			this.state._messagesToDelete = toDelete;
			this.state._skippedMessages = skipped;
		}

		async deleteMessagesFromList() {
			for (let i = 0; i < this.state._messagesToDelete.length; i++) {
				const m = this.state._messagesToDelete[i];
				if (!this.state.running) return log.error('Stopped.');

				log.debug(
					`[${this.state.delCount + 1}/${this.state.grandTotal}] ` +
					`<b>${redact(m.author.username)}</b>: ` +
					`<i>${redact((m.content || '').slice(0, 120)).replace(/\n/g, '↵')}</i>` +
					(m.attachments.length ? ' [+attachments]' : '')
				);

				let attempt = 0;
				while (attempt < this.options.maxAttempt) {
					const r = await this.deleteMessage(m);
					if (r === 'RETRY') {
						attempt++;
						log.verb(`Retrying (${attempt}/${this.options.maxAttempt})...`);
						await wait(this.options.deleteDelay);
					} else break;
				}

				this.calcEtr();
				if (this.onProgress) this.onProgress(this.state, this.stats);
				await wait(this.options.deleteDelay);
			}
		}

		async deleteMessage(m) {
			const url = `https://discord.com/api/v9/channels/${m.channel_id}/messages/${m.id}`;
			let resp;
			try {
				this.beforeRequest();
				resp = await fetch(url, {
					method: 'DELETE',
					headers: { 'Authorization': this.options.authToken },
				});
				this.afterRequest();
			} catch (err) {
				log.error('Delete request failed:', err);
				this.state.failCount++;
				return 'FAILED';
			}

			if (!resp.ok) {
				if (resp.status === 429) {
					const w = (await resp.json()).retry_after * 1000;
					this.stats.throttledCount++;
					this.stats.throttledTotalTime += w;
					this.options.deleteDelay = w;
					log.warn(`Rate limited! Delete delay -> ${w}ms.`);
					await wait(w * 2);
					return 'RETRY';
				}
				const body = await resp.text();
				try {
					const r = JSON.parse(body);
					if (resp.status === 400 && r.code === 50083) {
						log.warn('Thread archived, skipping.');
						this.state.offset++;
						this.state.failCount++;
						return 'FAIL_SKIP';
					}
					log.error(`Delete failed (${resp.status})`, r);
				} catch {
					log.error(`Delete failed (${resp.status})`, body);
				}
				this.state.failCount++;
				return 'FAILED';
			}

			this.state.delCount++;
			return 'OK';
		}

		beforeRequest() { this._beforeTs = Date.now(); }
		afterRequest() {
			this.stats.lastPing = Date.now() - this._beforeTs;
			this.stats.avgPing = this.stats.avgPing > 0
				? (this.stats.avgPing * 0.9) + (this.stats.lastPing * 0.1)
				: this.stats.lastPing;
		}
	}

	class DragResize {
		constructor(elm, handle) {
			this.elm = elm;
			this.handle = handle;
			this._initMove();
			this._initResize();
		}
		_initMove() {
			let sx, sy, sl, st;
			const move = e => {
				const dx = e.clientX - sx;
				const dy = e.clientY - sy;
				this.elm.style.left = Math.max(0, Math.min(window.innerWidth - 100, sl + dx)) + 'px';
				this.elm.style.top = Math.max(0, Math.min(window.innerHeight - 50, st + dy)) + 'px';
				this.elm.style.right = 'auto';
			};
			const up = () => {
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mouseup', up);
			};
			const down = e => {
				if (e.target.closest('button, input, a, .ndr-iconbtn')) return;
				sx = e.clientX; sy = e.clientY;
				const r = this.elm.getBoundingClientRect();
				sl = r.left; st = r.top;
				document.addEventListener('mousemove', move);
				document.addEventListener('mouseup', up);
				e.preventDefault();
			};
			this.handle.addEventListener('mousedown', down);
		}
		_initResize() {
			const grip = this.elm.querySelector('.ndr-resize');
			if (!grip) return;
			let sx, sy, sw, sh;
			const move = e => {
				this.elm.style.width = Math.max(560, sw + (e.clientX - sx)) + 'px';
				this.elm.style.height = Math.max(460, sh + (e.clientY - sy)) + 'px';
			};
			const up = () => {
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mouseup', up);
			};
			const down = e => {
				sx = e.clientX; sy = e.clientY;
				sw = this.elm.offsetWidth; sh = this.elm.offsetHeight;
				document.addEventListener('mousemove', move);
				document.addEventListener('mouseup', up);
				e.preventDefault();
			};
			grip.addEventListener('mousedown', down);
		}
	}

	function createElm(html) {
		const t = document.createElement('div');
		t.innerHTML = html.trim();
		return t.removeChild(t.firstElementChild);
	}

	function insertCss(css) {
		if (typeof GM_addStyle === 'function') {
			try { return GM_addStyle(css); } catch (_) { /* fallback */ }
		}
		const s = document.createElement('style');
		s.textContent = css;
		(document.head || document.documentElement).appendChild(s);
		return s;
	}

	const messagePicker = {
		init() { insertCss(pickerCss); },
		grab(aux) {
			return new Promise(resolve => {
				document.body.classList.add('ndr-pick');
				if (aux) document.body.classList.add(aux);
				const handler = e => {
					const msg = e.target.closest('[id^="message-content-"]');
					if (msg) {
						e.preventDefault();
						e.stopPropagation();
						e.stopImmediatePropagation();
						if (aux) document.body.classList.remove(aux);
						document.body.classList.remove('ndr-pick');
						document.removeEventListener('click', handler, true);
						try { resolve(msg.id.match(/message-content-(\d+)/)[1]); }
						catch { resolve(null); }
					}
				};
				document.addEventListener('click', handler, true);
			});
		}
	};

	function getToken() {
		try {
			let req;
			const id = 'ndr_' + Math.random().toString(36).slice(2);
			win.webpackChunkdiscord_app.push([[id], {}, r => { req = r; }]);
			win.webpackChunkdiscord_app.pop();
			if (!req) throw new Error('webpack require not found');
			const modules = Object.values(req.c || {});
			for (const mod of modules) {
				const exp = mod && mod.exports;
				if (!exp) continue;
				const candidates = [exp, exp.default, exp.Z, exp.ZP];
				for (const c of candidates) {
					if (c && typeof c.getToken === 'function') {
						const t = c.getToken();
						if (t) return t;
					}
				}
			}
			throw new Error('Token module not found');
		} catch (err) {
			log.warn('Token extraction failed:', err.message || err);
			try {
				const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
				return JSON.parse(LS.token);
			} catch {
				throw new Error('Could not auto-detect token. Paste it manually in Advanced settings.');
			}
		}
	}

	function getAuthorId() {
		try {
			const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
			return JSON.parse(LS.user_id_cache);
		} catch {
			log.warn('Could not auto-detect author ID.');
			return '';
		}
	}

	function getGuildId() {
		const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
		if (m) return m[1];
		alert('Could not find Guild ID. Open a server or DM first.');
		return '';
	}

	function getChannelId() {
		const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
		if (m) return m[2];
		alert('Could not find Channel ID. Open a channel or DM first.');
		return '';
	}

	function fillToken() {
		try { return getToken(); }
		catch (err) {
			log.error(err.message || 'Token extraction failed.');
			return '';
		}
	}

	const core = new DeleterCore();
	messagePicker.init();

	const ui = {};
	const $ = s => ui.app.querySelector(s);

	async function waitForBody() {
		if (document.body) return;
		await new Promise(r => {
			const obs = new MutationObserver(() => {
				if (document.body) { obs.disconnect(); r(); }
			});
			obs.observe(document.documentElement, { childList: true });
		});
	}

	async function initUI() {
		await waitForBody();
		insertCss(themeCss);

		ui.app = createElm(interp(appHtml, { VERSION, HOME, WIKI }));
		document.body.appendChild(ui.app);
		new DragResize(ui.app, ui.app.querySelector('.ndr-header'));

		ui.trigger = createElm(triggerHtml);
		ui.trigger.onclick = toggleApp;

		function findToolbar() {
			const candidates = document.querySelectorAll('#app-mount [class*="toolbar"]');
			for (const el of candidates) {
				if (el.children.length && el.closest('[class*="chat"], [class*="title"], [class*="header"]')) return el;
			}
			return candidates[0] || null;
		}
		function mountTrigger() {
			if (ui.trigger.isConnected) return;
			const tb = findToolbar();
			if (tb) tb.prepend(ui.trigger);
		}
		mountTrigger();

		const root = document.querySelector('#app-mount');
		let throttle = null;
		new MutationObserver(() => {
			if (throttle) return;
			throttle = setTimeout(() => {
				throttle = null;
				if (!ui.trigger.isConnected || !root.contains(ui.trigger)) mountTrigger();
			}, 500);
		}).observe(root, { childList: true, subtree: true });

		function toggleApp() {
			if (ui.app.style.display === 'none') {
				ui.app.style.display = '';
				ui.trigger.style.color = 'var(--ndr-accent)';
			} else {
				ui.app.style.display = 'none';
				ui.trigger.style.color = '';
			}
		}

		ui.logArea = $('#ndr-logArea');
		ui.autoScroll = $('#ndr-autoScroll');
		ui.progress = $('#ndr-progress');
		ui.progressBar = $('#ndr-progressBar');
		ui.status = $('#ndr-status');

		$('#ndr-hide').onclick = toggleApp;
		$('#ndr-toggleSidebar').onclick = () => ui.app.classList.toggle('ndr-collapsed');
		$('#ndr-start').onclick = startAction;
		$('#ndr-stop').onclick = stopAction;
		$('#ndr-clear').onclick = () => ui.logArea.innerHTML = '';
		$('#ndr-getAuthor').onclick = () => $('#ndr-authorId').value = getAuthorId();
		$('#ndr-getGuild').onclick = () => {
			const g = getGuildId();
			if (g) {
				$('#ndr-guildId').value = g;
				if (g === '@me') $('#ndr-channelId').value = getChannelId();
			}
		};
		$('#ndr-getChannel').onclick = () => {
			$('#ndr-channelId').value = getChannelId();
			$('#ndr-guildId').value = getGuildId();
		};
		$('#ndr-redact').onchange = e => ui.app.classList.toggle('ndr-redact', e.target.checked);
		$('#ndr-getToken').onclick = () => $('#ndr-token').value = fillToken();

		$('#ndr-pickAfter').onclick = async () => {
			toggleApp();
			const id = await messagePicker.grab('after');
			if (id) $('#ndr-minId').value = id;
			toggleApp();
		};
		$('#ndr-pickBefore').onclick = async () => {
			toggleApp();
			const id = await messagePicker.grab('before');
			if (id) $('#ndr-maxId').value = id;
			toggleApp();
		};

		$('#ndr-searchDelay').addEventListener('input', e => {
			$('#ndr-searchDelayValue').textContent = e.target.value + 'ms';
			core.options.searchDelay = parseInt(e.target.value);
		});
		$('#ndr-deleteDelay').addEventListener('input', e => {
			$('#ndr-deleteDelayValue').textContent = e.target.value + 'ms';
			core.options.deleteDelay = parseInt(e.target.value);
		});

		$('#ndr-importJson').onchange = async e => {
			const file = e.target.files[0];
			if (!file) return;
			$('#ndr-guildId').value = '@me';
			$('#ndr-authorId').value = getAuthorId();
			try {
				const json = JSON.parse(await file.text());
				const channelIds = Object.keys(json);
				$('#ndr-channelId').value = channelIds.join(',');
				log.info(`Loaded ${channelIds.length} channels from archive.`);
			} catch (err) {
				log.error('Invalid JSON file:', err.message);
			}
		};

		setLogFn(printLog);
		setupCoreHandlers();
	}

	function printLog(type, args) {
		ui.logArea.insertAdjacentHTML('beforeend',
			`<div class="log log-${type}">${Array.from(args).map(o =>
				typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o
			).join(' ')}</div>`);
		if (ui.autoScroll.checked) ui.logArea.scrollTop = ui.logArea.scrollHeight;
		if (type === 'error') console.error(PREFIX, ...Array.from(args));
	}

	function setupCoreHandlers() {
		core.onStart = () => {
			$('#ndr-start').disabled = true;
			$('#ndr-stop').disabled = false;
			ui.trigger.classList.add('running');
			ui.progress.style.display = 'block';
			ui.status.textContent = 'Running...';
		};
		core.onProgress = (state, stats) => {
			const max = Math.max(state.grandTotal, state.delCount + state.failCount, 1);
			const value = state.delCount + state.failCount;
			const pct = Math.round(value / max * 100);
			ui.progressBar.style.width = pct + '%';
			const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
			const remaining = msToHMS(stats.etr);
			ui.status.textContent = `${value}/${max} (${pct}%) · ${elapsed} elapsed · ${remaining} left`;
		};
		core.onStop = () => {
			$('#ndr-start').disabled = false;
			$('#ndr-stop').disabled = true;
			ui.trigger.classList.remove('running');
			ui.progress.style.display = 'none';
			ui.status.textContent = 'Done';
		};
	}

	async function startAction() {
		const authorId = $('#ndr-authorId').value.trim();
		const guildId = $('#ndr-guildId').value.trim();
		const channelIds = $('#ndr-channelId').value.trim().split(/\s*,\s*/).filter(Boolean);
		const includeNsfw = $('#ndr-includeNsfw').checked;
		const content = $('#ndr-search').value.trim();
		const hasLink = $('#ndr-hasLink').checked;
		const hasFile = $('#ndr-hasFile').checked;
		const includePinned = $('#ndr-includePinned').checked;
		const pattern = $('#ndr-pattern').value;
		const minId = $('#ndr-minId').value.trim();
		const maxId = $('#ndr-maxId').value.trim();
		const minDate = $('#ndr-minDate').value.trim();
		const maxDate = $('#ndr-maxDate').value.trim();
		const searchDelay = parseInt($('#ndr-searchDelay').value);
		const deleteDelay = parseInt($('#ndr-deleteDelay').value);
		const authToken = $('#ndr-token').value.trim() || fillToken();

		if (!authToken) return;
		if (!guildId) return log.error('Server ID required (use @me for DMs).');
		if (!channelIds.length) return log.error('Channel ID required.');

		ui.logArea.innerHTML = '';
		core.resetState();
		core.options = {
			...core.options,
			authToken, authorId, guildId,
			channelId: channelIds.length === 1 ? channelIds[0] : undefined,
			minId: minId || minDate,
			maxId: maxId || maxDate,
			content, hasLink, hasFile, includeNsfw, includePinned, pattern,
			searchDelay, deleteDelay,
		};

		if (channelIds.length > 1) {
			const jobs = channelIds.map(ch => ({ guildId, channelId: ch }));
			try { await core.runBatch(jobs); }
			catch (err) { log.error('Batch error:', err); }
		} else {
			try { await core.run(); }
			catch (err) { log.error('Error:', err); core.stop(); }
		}
	}

	function stopAction() {
		core.stop();
	}

	initUI();
})();

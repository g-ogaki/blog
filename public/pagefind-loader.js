import * as pagefind from "/pagefind/pagefind.js";

window.__monipyPagefind = pagefind;
window.dispatchEvent(new Event("monipy:pagefind-ready"));

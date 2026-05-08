const webview = document.getElementById("browser-view");

const urlForm = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");

const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");

const statusText = document.getElementById("status-text");
const pageTitle = document.getElementById("page-title");

const HOME_URL = window.navnerd?.homeUrl || "https://www.google.com";

function setStatus(text) {
  statusText.textContent = text;
}

function setTitle(text) {
  pageTitle.textContent = text || "Navegador v0.1";
}

function normalizeUrl(input) {
  const value = input.trim();

  if (!value) {
    return HOME_URL;
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value);

  if (hasProtocol) {
    return value;
  }

  const looksLikeUrl = value.includes(".") && !value.includes(" ");

  if (looksLikeUrl) {
    return `https://${value}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}

function navigateTo(input) {
  const url = normalizeUrl(input);

  setStatus("Carregando...");
  urlInput.value = url;

  webview.loadURL(url);
}

function updateNavigationButtons() {
  try {
    btnBack.disabled = !webview.canGoBack();
    btnForward.disabled = !webview.canGoForward();
  } catch {
    btnBack.disabled = true;
    btnForward.disabled = true;
  }
}

urlForm.addEventListener("submit", (event) => {
  event.preventDefault();
  navigateTo(urlInput.value);
});

btnBack.addEventListener("click", () => {
  if (webview.canGoBack()) {
    webview.goBack();
  }
});

btnForward.addEventListener("click", () => {
  if (webview.canGoForward()) {
    webview.goForward();
  }
});

btnReload.addEventListener("click", () => {
  webview.reload();
});

btnHome.addEventListener("click", () => {
  navigateTo(HOME_URL);
});

webview.addEventListener("did-start-loading", () => {
  setStatus("Carregando...");
});

webview.addEventListener("did-stop-loading", () => {
  setStatus("Pronto");
  updateNavigationButtons();

  try {
    const currentUrl = webview.getURL();
    if (currentUrl) {
      urlInput.value = currentUrl;
    }
  } catch {
    // Ignora falha de leitura da URL
  }
});

webview.addEventListener("did-navigate", (event) => {
  urlInput.value = event.url;
  updateNavigationButtons();
});

webview.addEventListener("did-navigate-in-page", (event) => {
  urlInput.value = event.url;
  updateNavigationButtons();
});

webview.addEventListener("page-title-updated", (event) => {
  setTitle(event.title);
  document.title = `${event.title} - NavNerd`;
});

webview.addEventListener("did-fail-load", (event) => {
  // -3 geralmente é navegação cancelada; não precisa assustar o usuário
  if (event.errorCode === -3) {
    return;
  }

  setStatus(`Erro ao carregar: ${event.errorDescription}`);
});

webview.addEventListener("dom-ready", () => {
  updateNavigationButtons();
  urlInput.value = webview.getURL() || HOME_URL;
});

window.addEventListener("keydown", (event) => {
  const isCtrlL = event.ctrlKey && event.key.toLowerCase() === "l";
  const isCtrlR = event.ctrlKey && event.key.toLowerCase() === "r";
  const isAltLeft = event.altKey && event.key === "ArrowLeft";
  const isAltRight = event.altKey && event.key === "ArrowRight";

  if (isCtrlL) {
    event.preventDefault();
    urlInput.focus();
    urlInput.select();
  }

  if (isCtrlR) {
    event.preventDefault();
    webview.reload();
  }

  if (isAltLeft && webview.canGoBack()) {
    event.preventDefault();
    webview.goBack();
  }

  if (isAltRight && webview.canGoForward()) {
    event.preventDefault();
    webview.goForward();
  }
});
const webviewsContainer = document.getElementById("webviews-container");

const homeView = document.getElementById("home-view");
const sidebar = document.getElementById("sidebar");

const tabsList = document.getElementById("tabs-list");

const urlForm = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");

const homeSearchForm = document.getElementById("home-search-form");
const homeSearchInput = document.getElementById("home-search-input");

const btnSidebar = document.getElementById("btn-sidebar");
const btnCloseSidebar = document.getElementById("btn-close-sidebar");
const btnNewTab = document.getElementById("btn-new-tab");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");
const btnFavorite = document.getElementById("btn-favorite");
const btnClearHistory = document.getElementById("btn-clear-history");

const statusText = document.getElementById("status-text");
const pageTitle = document.getElementById("page-title");

const sidebarFavorites = document.getElementById("sidebar-favorites");
const sidebarHistory = document.getElementById("sidebar-history");
const homeFavorites = document.getElementById("home-favorites");
const homeHistory = document.getElementById("home-history");

const APP_NAME = window.navnerd?.appName || "NavNerd";
const APP_VERSION = window.navnerd?.version || "0.3.0";
const HOME_URL = window.navnerd?.homeUrl || "navnerd://home";

const STORAGE_KEYS = {
  favorites: "navnerd:favorites",
  history: "navnerd:history"
};

let tabs = [];
let activeTabId = null;
let tabCounter = 0;

function setStatus(text) {
  statusText.textContent = text;
}

function setTitle(text) {
  const safeTitle = text || `Navegador ${APP_VERSION}`;
  pageTitle.textContent = safeTitle;
  document.title = `${safeTitle} - ${APP_NAME}`;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFavorites() {
  return readStorage(STORAGE_KEYS.favorites, []);
}

function saveFavorites(favorites) {
  writeStorage(STORAGE_KEYS.favorites, favorites);
}

function getHistory() {
  return readStorage(STORAGE_KEYS.history, []);
}

function saveHistory(history) {
  writeStorage(STORAGE_KEYS.history, history);
}

function getActiveTab() {
  return tabs.find((tab) => tab.id === activeTabId) || null;
}

function getTabById(tabId) {
  return tabs.find((tab) => tab.id === tabId) || null;
}

function getActiveWebview() {
  const activeTab = getActiveTab();

  if (!activeTab || !activeTab.webview) {
    return null;
  }

  return activeTab.webview;
}

function isInternalUrl(url) {
  return !url || url === HOME_URL || url === "about:blank" || url.startsWith("navnerd://");
}

function normalizeUrl(input) {
  const value = input.trim();

  if (!value) {
    return HOME_URL;
  }

  if (value === HOME_URL || value.toLowerCase() === "home") {
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

function createTab(initialUrl = HOME_URL, shouldActivate = true) {
  const id = `tab-${Date.now()}-${++tabCounter}`;

  const tab = {
    id,
    title: "Nova aba",
    url: HOME_URL,
    isHome: true,
    webview: null,
    isLoading: false
  };

  tabs.push(tab);

  if (shouldActivate) {
    activeTabId = id;
  }

  renderTabs();
  refreshActiveView();

  if (initialUrl && initialUrl !== HOME_URL) {
    if (shouldActivate) {
      navigateTo(initialUrl);
    } else {
      navigateTabTo(id, initialUrl);
    }
  }

  return tab;
}

function closeTab(tabId) {
  if (tabs.length === 0) {
    return;
  }

  const closingIndex = tabs.findIndex((tab) => tab.id === tabId);

  if (closingIndex === -1) {
    return;
  }

  const tab = tabs[closingIndex];

  if (tab.webview) {
    tab.webview.remove();
  }

  tabs.splice(closingIndex, 1);

  if (tabs.length === 0) {
    createTab(HOME_URL, true);
    return;
  }

  if (activeTabId === tabId) {
    const nextIndex = Math.min(closingIndex, tabs.length - 1);
    activeTabId = tabs[nextIndex].id;
  }

  renderTabs();
  refreshActiveView();
}

function closeActiveTab() {
  const activeTab = getActiveTab();

  if (!activeTab) {
    return;
  }

  closeTab(activeTab.id);
}

function activateTab(tabId) {
  const tab = getTabById(tabId);

  if (!tab) {
    return;
  }

  activeTabId = tabId;

  renderTabs();
  refreshActiveView();
}

function activateNextTab(direction = 1) {
  if (tabs.length <= 1) {
    return;
  }

  const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);

  if (currentIndex === -1) {
    activeTabId = tabs[0].id;
    refreshActiveView();
    return;
  }

  let nextIndex = currentIndex + direction;

  if (nextIndex >= tabs.length) {
    nextIndex = 0;
  }

  if (nextIndex < 0) {
    nextIndex = tabs.length - 1;
  }

  activateTab(tabs[nextIndex].id);
}

function activateTabByNumber(number) {
  const index = number - 1;

  if (!tabs[index]) {
    return;
  }

  activateTab(tabs[index].id);
}

function createWebviewForTab(tab) {
  if (tab.webview) {
    return tab.webview;
  }

  const webview = document.createElement("webview");

  webview.id = `webview-${tab.id}`;
  webview.className = "browser-webview hidden";
  webview.setAttribute("src", "about:blank");

  // Mesma partição para compartilhar cookies/sessão entre abas.
  webview.setAttribute("partition", "persist:navnerd");

  webviewsContainer.appendChild(webview);

  setupWebviewEvents(webview, tab.id);

  tab.webview = webview;

  return webview;
}

function setupWebviewEvents(webview, tabId) {
  webview.addEventListener("did-start-loading", () => {
    const tab = getTabById(tabId);

    if (!tab) {
      return;
    }

    tab.isLoading = true;

    if (tab.id === activeTabId) {
      setStatus("Carregando...");
    }

    renderTabs();
  });

  webview.addEventListener("did-stop-loading", () => {
    const tab = getTabById(tabId);

    if (!tab) {
      return;
    }

    tab.isLoading = false;

    try {
      const url = webview.getURL();
      const title = webview.getTitle();

      if (url && !isInternalUrl(url)) {
        tab.url = url;
        tab.title = title || url;
        tab.isHome = false;

        addToHistory(url, tab.title);
      }
    } catch {
      // Ignora falha de leitura da URL
    }

    if (tab.id === activeTabId) {
      setStatus("Pronto");
      refreshActiveView();
    }

    renderTabs();
  });

  webview.addEventListener("did-navigate", (event) => {
    const tab = getTabById(tabId);

    if (!tab || isInternalUrl(event.url)) {
      return;
    }

    tab.url = event.url;
    tab.isHome = false;

    if (tab.id === activeTabId) {
      urlInput.value = event.url;
    }

    renderTabs();
  });

  webview.addEventListener("did-navigate-in-page", (event) => {
    const tab = getTabById(tabId);

    if (!tab || isInternalUrl(event.url)) {
      return;
    }

    tab.url = event.url;
    tab.isHome = false;

    if (tab.id === activeTabId) {
      urlInput.value = event.url;
    }

    renderTabs();
  });

  webview.addEventListener("page-title-updated", (event) => {
    const tab = getTabById(tabId);

    if (!tab) {
      return;
    }

    tab.title = event.title || tab.url || "Nova aba";

    if (tab.id === activeTabId) {
      setTitle(tab.title);
      updateFavoriteButton();
    }

    renderTabs();
  });

  webview.addEventListener("did-fail-load", (event) => {
    const tab = getTabById(tabId);

    if (!tab) {
      return;
    }

    tab.isLoading = false;

    // -3 geralmente significa navegação cancelada.
    if (event.errorCode === -3) {
      return;
    }

    if (tab.id === activeTabId) {
      setStatus(`Erro ao carregar: ${event.errorDescription}`);
    }

    renderTabs();
  });

  webview.addEventListener("dom-ready", () => {
    const tab = getTabById(tabId);

    if (!tab) {
      return;
    }

    try {
      const url = webview.getURL();
      const title = webview.getTitle();

      if (url && !isInternalUrl(url)) {
        tab.url = url;
        tab.title = title || url;
        tab.isHome = false;
      }
    } catch {
      // Ignora falha
    }

    if (tab.id === activeTabId) {
      refreshActiveView();
    }

    renderTabs();
  });
}

function hideAllWebviews() {
  tabs.forEach((tab) => {
    if (tab.webview) {
      tab.webview.classList.add("hidden");
    }
  });
}

function refreshActiveView() {
  const activeTab = getActiveTab();

  hideAllWebviews();

  if (!activeTab) {
    return;
  }

  if (activeTab.isHome || isInternalUrl(activeTab.url)) {
    homeView.classList.remove("hidden");

    urlInput.value = "";
    setTitle(activeTab.title || `Navegador ${APP_VERSION}`);
    setStatus("Página inicial");
  } else {
    homeView.classList.add("hidden");

    const webview = createWebviewForTab(activeTab);
    webview.classList.remove("hidden");

    urlInput.value = activeTab.url;
    setTitle(activeTab.title || activeTab.url);
    setStatus(activeTab.isLoading ? "Carregando..." : "Pronto");
  }

  updateNavigationButtons();
  updateFavoriteButton();
  renderAllLists();
}

function navigateTo(input) {
  const activeTab = getActiveTab();

  if (!activeTab) {
    createTab(HOME_URL, true);
    return;
  }

  navigateTabTo(activeTab.id, input);
}

function navigateTabTo(tabId, input) {
  const tab = getTabById(tabId);

  if (!tab) {
    return;
  }

  const url = normalizeUrl(input);

  if (url === HOME_URL) {
    tab.url = HOME_URL;
    tab.title = "Nova aba";
    tab.isHome = true;
    tab.isLoading = false;

    if (tab.id === activeTabId) {
      refreshActiveView();
    }

    renderTabs();
    return;
  }

  tab.url = url;
  tab.title = url;
  tab.isHome = false;
  tab.isLoading = true;

  const webview = createWebviewForTab(tab);

  if (tab.id === activeTabId) {
    homeView.classList.add("hidden");
    hideAllWebviews();
    webview.classList.remove("hidden");

    setStatus("Carregando...");
    urlInput.value = url;
    updateNavigationButtons();
  }

  webview.loadURL(url);

  renderTabs();
}

function updateNavigationButtons() {
  const activeTab = getActiveTab();
  const webview = getActiveWebview();

  if (!activeTab || activeTab.isHome || !webview) {
    btnBack.disabled = true;
    btnForward.disabled = true;
    btnReload.disabled = true;
    return;
  }

  try {
    btnBack.disabled = !webview.canGoBack();
    btnForward.disabled = !webview.canGoForward();
    btnReload.disabled = false;
  } catch {
    btnBack.disabled = true;
    btnForward.disabled = true;
    btnReload.disabled = true;
  }
}

function pageIsFavorite(url) {
  if (isInternalUrl(url)) {
    return false;
  }

  return getFavorites().some((favorite) => favorite.url === url);
}

function updateFavoriteButton() {
  const activeTab = getActiveTab();

  if (!activeTab || activeTab.isHome || isInternalUrl(activeTab.url)) {
    btnFavorite.textContent = "☆";
    btnFavorite.disabled = true;
    return;
  }

  btnFavorite.disabled = false;
  btnFavorite.textContent = pageIsFavorite(activeTab.url) ? "★" : "☆";
}

function toggleFavorite() {
  const activeTab = getActiveTab();

  if (!activeTab || activeTab.isHome || isInternalUrl(activeTab.url)) {
    return;
  }

  const favorites = getFavorites();
  const exists = favorites.some((favorite) => favorite.url === activeTab.url);

  if (exists) {
    const updatedFavorites = favorites.filter((favorite) => favorite.url !== activeTab.url);
    saveFavorites(updatedFavorites);
    setStatus("Favorito removido");
  } else {
    const newFavorite = {
      url: activeTab.url,
      title: activeTab.title || activeTab.url,
      createdAt: new Date().toISOString()
    };

    saveFavorites([newFavorite, ...favorites]);
    setStatus("Página adicionada aos favoritos");
  }

  updateFavoriteButton();
  renderAllLists();
}

function addToHistory(url, title) {
  if (isInternalUrl(url)) {
    return;
  }

  const history = getHistory();
  const filteredHistory = history.filter((item) => item.url !== url);

  const newItem = {
    url,
    title: title || url,
    visitedAt: new Date().toISOString()
  };

  const updatedHistory = [newItem, ...filteredHistory].slice(0, 120);

  saveHistory(updatedHistory);
  renderAllLists();
}

function removeFavorite(url) {
  const favorites = getFavorites().filter((favorite) => favorite.url !== url);
  saveFavorites(favorites);

  setStatus("Favorito removido");

  updateFavoriteButton();
  renderAllLists();
}

function clearHistory() {
  const confirmed = confirm("Deseja limpar todo o histórico do NavNerd?");

  if (!confirmed) {
    return;
  }

  saveHistory([]);
  setStatus("Histórico limpo");
  renderAllLists();
}

function formatDate(isoDate) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(isoDate));
  } catch {
    return "";
  }
}

function getTabDisplayTitle(tab) {
  if (!tab) {
    return "Nova aba";
  }

  if (tab.isHome || isInternalUrl(tab.url)) {
    return "Nova aba";
  }

  return tab.title || tab.url || "Carregando...";
}

function renderTabs() {
  tabsList.innerHTML = "";

  tabs.forEach((tab) => {
    const tabItem = document.createElement("div");
    tabItem.className = "tab-item";

    if (tab.id === activeTabId) {
      tabItem.classList.add("active");
    }

    if (tab.isLoading) {
      tabItem.classList.add("loading");
    }

    const tabMain = document.createElement("button");
    tabMain.className = "tab-main";
    tabMain.type = "button";
    tabMain.title = tab.url || "Nova aba";

    const icon = document.createElement("span");
    icon.className = "tab-icon";
    icon.textContent = tab.isLoading ? "●" : "◉";

    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = getTabDisplayTitle(tab);

    tabMain.appendChild(icon);
    tabMain.appendChild(title);

    tabMain.addEventListener("click", () => {
      activateTab(tab.id);
    });

    const closeButton = document.createElement("button");
    closeButton.className = "tab-close";
    closeButton.type = "button";
    closeButton.title = "Fechar aba";
    closeButton.textContent = "×";

    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    tabItem.appendChild(tabMain);
    tabItem.appendChild(closeButton);

    tabsList.appendChild(tabItem);
  });
}

function createListItem(item, options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "list-item";

  const content = document.createElement("button");
  content.className = "list-content";
  content.type = "button";

  const title = document.createElement("strong");
  title.textContent = item.title || item.url;

  const url = document.createElement("span");
  url.textContent = item.url;

  content.appendChild(title);
  content.appendChild(url);

  content.addEventListener("click", () => {
    navigateTo(item.url);
  });

  wrapper.appendChild(content);

  if (options.showDate && item.visitedAt) {
    const date = document.createElement("small");
    date.textContent = formatDate(item.visitedAt);
    wrapper.appendChild(date);
  }

  if (options.allowRemove) {
    const removeButton = document.createElement("button");
    removeButton.className = "remove-btn";
    removeButton.type = "button";
    removeButton.title = "Remover favorito";
    removeButton.textContent = "×";

    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeFavorite(item.url);
    });

    wrapper.appendChild(removeButton);
  }

  return wrapper;
}

function renderFavorites(container, limit = 999) {
  const favorites = getFavorites().slice(0, limit);

  container.innerHTML = "";

  if (favorites.length === 0) {
    container.innerHTML = `<p class="empty-text">Nenhum favorito ainda.</p>`;
    return;
  }

  favorites.forEach((favorite) => {
    container.appendChild(
      createListItem(favorite, {
        allowRemove: true
      })
    );
  });
}

function renderHistory(container, limit = 999) {
  const history = getHistory().slice(0, limit);

  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `<p class="empty-text">Histórico vazio.</p>`;
    return;
  }

  history.forEach((item) => {
    container.appendChild(
      createListItem(item, {
        showDate: true
      })
    );
  });
}

function renderAllLists() {
  renderFavorites(sidebarFavorites);
  renderFavorites(homeFavorites, 8);

  renderHistory(sidebarHistory);
  renderHistory(homeHistory, 10);
}

urlForm.addEventListener("submit", (event) => {
  event.preventDefault();
  navigateTo(urlInput.value);
});

homeSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = homeSearchInput.value;
  homeSearchInput.value = "";

  navigateTo(value);
});

btnNewTab.addEventListener("click", () => {
  createTab(HOME_URL, true);
});

btnSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

btnCloseSidebar.addEventListener("click", () => {
  sidebar.classList.remove("open");
});

btnBack.addEventListener("click", () => {
  const webview = getActiveWebview();

  if (webview && webview.canGoBack()) {
    webview.goBack();
  }
});

btnForward.addEventListener("click", () => {
  const webview = getActiveWebview();

  if (webview && webview.canGoForward()) {
    webview.goForward();
  }
});

btnReload.addEventListener("click", () => {
  const webview = getActiveWebview();
  const activeTab = getActiveTab();

  if (webview && activeTab && !activeTab.isHome) {
    webview.reload();
  }
});

btnHome.addEventListener("click", () => {
  navigateTo(HOME_URL);
});

btnFavorite.addEventListener("click", () => {
  toggleFavorite();
});

btnClearHistory.addEventListener("click", () => {
  clearHistory();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  const isCtrlL = event.ctrlKey && key === "l";
  const isCtrlR = event.ctrlKey && key === "r";
  const isCtrlD = event.ctrlKey && key === "d";
  const isCtrlH = event.ctrlKey && key === "h";
  const isCtrlT = event.ctrlKey && key === "t";
  const isCtrlW = event.ctrlKey && key === "w";
  const isCtrlTab = event.ctrlKey && event.key === "Tab" && !event.shiftKey;
  const isCtrlShiftTab = event.ctrlKey && event.key === "Tab" && event.shiftKey;
  const isAltLeft = event.altKey && event.key === "ArrowLeft";
  const isAltRight = event.altKey && event.key === "ArrowRight";

  if (isCtrlL) {
    event.preventDefault();
    urlInput.focus();
    urlInput.select();
  }

  if (isCtrlR) {
    event.preventDefault();

    const webview = getActiveWebview();
    const activeTab = getActiveTab();

    if (webview && activeTab && !activeTab.isHome) {
      webview.reload();
    }
  }

  if (isCtrlD) {
    event.preventDefault();
    toggleFavorite();
  }

  if (isCtrlH) {
    event.preventDefault();
    sidebar.classList.toggle("open");
  }

  if (isCtrlT) {
    event.preventDefault();
    createTab(HOME_URL, true);
  }

  if (isCtrlW) {
    event.preventDefault();
    closeActiveTab();
  }

  if (isCtrlTab) {
    event.preventDefault();
    activateNextTab(1);
  }

  if (isCtrlShiftTab) {
    event.preventDefault();
    activateNextTab(-1);
  }

  if (isAltLeft) {
    const webview = getActiveWebview();

    if (webview && webview.canGoBack()) {
      event.preventDefault();
      webview.goBack();
    }
  }

  if (isAltRight) {
    const webview = getActiveWebview();

    if (webview && webview.canGoForward()) {
      event.preventDefault();
      webview.goForward();
    }
  }

  if (event.ctrlKey && /^[1-9]$/.test(event.key)) {
    event.preventDefault();
    activateTabByNumber(Number(event.key));
  }
});

createTab(HOME_URL, true);
renderAllLists();
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "NavNerd",
    backgroundColor: "#0b1020",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),

      // Segurança básica
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,

      // Permite usar a tag <webview>
      webviewTag: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Remove o menu padrão do Electron
  mainWindow.removeMenu();

  // Impede que janelas externas sejam abertas livremente pelo app principal
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
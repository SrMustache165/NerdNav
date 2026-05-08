const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("navnerd", {
  appName: "NavNerd",
  homeUrl: "https://www.google.com"
});
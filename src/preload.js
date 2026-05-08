const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("navnerd", {
  appName: "NavNerd",
  version: "0.3.0",
  homeUrl: "navnerd://home"
});
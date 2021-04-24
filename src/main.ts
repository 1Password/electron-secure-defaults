/* eng-disable PRELOAD_JS_CHECK */

import { app, BrowserWindow, ipcMain, Session, session } from "electron";
import * as path from "path";

function createWindow(session: Session) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      // SECURITY: use a custom session without a cache
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#disable-session-cache
      session,
      // SECURITY: disable node integration for remote content
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-2
      nodeIntegration: false,
      // SECURITY: enable context isolation for remote content
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-3
      contextIsolation: true,
      // SECURITY: disable the remote module
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#remote-module
      enableRemoteModule: false,
      // SECURITY: sanitize JS values that cross the contextBridge
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-3
      worldSafeExecuteJavaScript: true,
      // SECURITY: restrict dev tools access in the packaged app
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#restrict-dev-tools
      devTools: !app.isPackaged,
      // SECURITY: disable navigation via middle-click
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#disable-new-window
      disableBlinkFeatures: "Auxclick",
      // SECURITY: sandbox renderer content
      // https://github.com/1password/electron-secure-defaults/SECURITY.md#sandbox
      sandbox: true,
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(app.getAppPath(), "../index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// SECURITY: sandbox all renderer content
// https://github.com/1password/electron-secure-defaults/SECURITY.md#sandox
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // SECURITY: use a custom persistent session without a cache
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#disable-session-cache
  const secureSession = session.fromPartition("persist:app", {
    cache: false,
  });

  createWindow(secureSession);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(secureSession);
  });

  // SECURITY: deny permission requests from renderer
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-4
  secureSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    }
  );

  // SECURITY: define a strict CSP
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-6
  secureSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'self'; object-src: 'none'"],
      },
    });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (_ev, contents) => {
  // SECURITY: verify webview options before creation
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-11
  contents.on("will-attach-webview", (ev) => {
    ev.preventDefault(); // eng-disable
  });

  // SECURITY: disable or limit navigation
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-12
  contents.on("will-navigate", (ev) => {
    ev.preventDefault();
  });

  // SECURITY: disable or limit creation of new windows
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-13
  contents.on("new-window", (ev) => {
    ev.preventDefault();
  });

  // SECURITY: further prevent new window creation
  // https://github.com/1password/electron-secure-defaults/SECURITY.md#prevent-new-window
  contents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Handle messages and invocations coming from the renderer API

ipcMain.on("sayHello", (_ev, name: string) => {
  console.log(`Hello, ${name}, from the renderer process!`);
});

ipcMain.handle("getAppMetrics", () => app.getAppMetrics());

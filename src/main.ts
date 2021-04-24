/* eng-disable PRELOAD_JS_CHECK */

import { app, BrowserWindow, ipcMain, Session, session } from "electron";
import * as path from "path";

function createWindow(session: Session) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      // SECURITY: use the custom secure session
      session,
      // SECURITY: disable node integration for remote content
      //https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
      nodeIntegration: false,
      // SECURITY: enable context isolation for remote content
      // https://www.electronjs.org/docs/tutorial/security#3-enable-context-isolation-for-remote-content
      contextIsolation: true,
      // SECURITY: disable the remote module
      // https://www.electronjs.org/docs/tutorial/security#15-disable-the-remote-module
      enableRemoteModule: false,
      // SECURITY: sanitize JS values that cross the contextBridge (enabled by default in Electron 12)
      // https://github.com/electron/electron/pull/24114
      worldSafeExecuteJavaScript: true,
      // SECURITY: restrict web inspector access in the packaged app
      devTools: !app.isPackaged,
      // SECURITY: disable navigation to untrusted origins via middle-click
      // https://github.com/doyensec/electronegativity/wiki/AUXCLICK_JS_CHECK
      disableBlinkFeatures: "Auxclick",
      // SECURITY: sandbox this renderer content
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
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // SECURITY: use a custom session to control aspects
  // such as persistence, caching, and network requests.
  const secureSession = session.fromPartition("persist:app", {
    // SECURITY: do not use an on-disk cache for network data and images
    cache: false,
  });

  createWindow(secureSession);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(secureSession);
  });

  // SECURITY: deny permission requests from renderer
  // https://www.electronjs.org/docs/tutorial/security#4-handle-session-permission-requests-from-remote-content
  secureSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    }
  );

  // SECURITY: define a strict CSP
  //www.electronjs.org/docs/tutorial/security#6-define-a-content-security-policy
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
  // eng-disable
  // SECURITY: verify webview options before creation
  // https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
  contents.on("will-attach-webview", (ev) => {
    ev.preventDefault(); // eng-disable
  });

  // SECURITY: disable or limit navigation
  // https://www.electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
  contents.on("will-navigate", (ev) => {
    ev.preventDefault();
  });

  // SECURITY: disable or limit creation of new windows
  // https://www.electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
  contents.on("new-window", (ev) => {
    ev.preventDefault();
  });
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Handle messages and invocations coming from the renderer API

ipcMain.on("sayHello", (_ev, name: string) => {
  console.log(`Hello, ${name}, from the renderer process!`);
});

ipcMain.handle("getAppMetrics", () => app.getAppMetrics());

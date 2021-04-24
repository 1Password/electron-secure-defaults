// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// Message will be logged in the main process (stdout)
window.api.sayHello("Electron");

window.api.getAppMetrics().then((metrics) => {
  // Message will be logged in the web inspector
  console.log("App metrics from main process", metrics);
});

# electron-secure-defaults

This is a security-enhanced fork of [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript). It can be used as a starter kit for a new Electron app, or as an annotated resource for annyone looking to harden an existing app.

The configuration in this repository is used in conjunction with [electron-hardener](https://github.com/1password/electron-hardener) to secure the [1Password](https://1password.com) desktop app.

## Usage

Build and run the quick start demo with `npm install && npm start`. For more detail, see [electron-quick-start-typescript](https://github.com/electron/electron-quick-start-typescript) to b

[Electronegativity](https://github.com/doyensec/electronegativity) is included for static analysis. Run `npm run electronegativity` to check for vulnerabilities. Warnings which are correctly handled in the codebase are suppressed.

## Security Design

The decisions made in this repository are informed by a number of sources:

- [Electron security checklist](https://www.electronjs.org/docs/tutorial/security#checklist-security-recommendations)
- [Electronegativity](https://github.com/doyensec/electronegativity)
- Regular internal security audits and reviews at 1Password

Settings are chosen for their applicability to the security and privacy design of the 1Password desktop app. We believe these are reasonable defaults for other modern apps, but it is your responsibility to understand the security goals of your application and the expectations of your users.

Security-sensitive code in the repository is annotated, and can be looked up by searching for `// SECURITY:`. Inline links are provided to the relevant sections below.

## Electron security checklist

This project tracks the offcial Electron [security checklist](https://www.electronjs.org/docs/tutorial/security#checklist-security-recommendations). Implementation status for each rule is given below.

<a name="rule-1"></a>

### 1. Only load secure content

Rule: https://www.electronjs.org/docs/tutorial/security#1-only-load-secure-content

Status: ✅

The app loads its executable code from `file://` URIs within the bundle. Remote URLs must be HTTPs and must be declared in the CSP.

<a name="rule-2"></a>

### 2. Do not enable Node.js integration for remote content

Rule: https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content

Status: ✅

Disabled by default in modern versions of Electron. `nodeIntegration` is also explicitly set to `false` in the the browser window.

<a name="rule-3"></a>

### 3. Enable context isolation for remote content

Rule: https://www.electronjs.org/docs/tutorial/security#3-enable-context-isolation-for-remote-content

Status: ✅

Enabled by default in Electron 12. `contextIsolation` is also explicitly set to `true` for the browser window.

A limited API is provided to the renderer process over the `ContextBridge`.

<a name="rule-4"></a

### 4. Handle session permission requests from remote content

Rule: https://www.electronjs.org/docs/tutorial/security#4-handle-session-permission-requests-from-remote-content

Status: ✅

All permission requests on the session are denied.

<a name="rule-5"></a>

### 5. Do not disable WebSecurity

Rule: https://www.electronjs.org/docs/tutorial/security#5-do-not-disable-websecurity

Status: ✅

Enabled by default.

<a name="rule-6"></a>

### 6. Define a Content Security Policy

Rule: https://www.electronjs.org/docs/tutorial/security#6-define-a-content-security-policy

Status: ✅

A restrictive CSP is defined in the session HTTP header, which is the preferred method. It should be updated for the specific remote acess needs of the application.

<a name="rule-7"></a>

### 7. Do not set `allowRunningInsecureContent` to `true`

Rule: https://www.electronjs.org/docs/tutorial/security#7-do-not-set-allowrunninginsecurecontent-to-true

Status: ✅

Disabled by default.

<a name="rule-8"></a>

### 8. Do not enable experimental features

Rule: https://www.electronjs.org/docs/tutorial/security#8-do-not-enable-experimental-features

Status: ✅

Disabled by default.

<a name="rule-9"></a>

### 9. Do not use `enableBlinkFeatures`

Rule: https://www.electronjs.org/docs/tutorial/security#9-do-not-use-enableblinkfeatures

Status: ✅

Disabled by default.

<a name="rule-10"></a>

### 10. Do not use `allowPopups`

Rule: https://www.electronjs.org/docs/tutorial/security#10-do-not-use-allowpopups

Status: ✅

Not used by default.

<a name="rule-11"></a>

### 11. Verify WebView options before creation

Rule: https://www.electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation

Status: ✅

The app blocks `<webview>` tag creation in the renderer.

<a name="rule-12"></a>

### 12. Disable or limit navigation

Rule: https://www.electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation

Status: ✅

The app blocks all navigation in the renderer.

<a name="rule-13"></a>

### 13. Disable or limit creation of new windows

Rule: https://www.electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows

Status: ✅

The app blocks creation of new windows from the renderer.

<a name="rule-14"></a>

### 14. Do not use `openExternal` with untrusted content

Rule: https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content.

Status: ✅

Not used by default.

<a name="rule-15"></a>

### 15. Use a current version of Electron

Rule: https://www.electronjs.org/docs/tutorial/security#17-use-a-current-version-of-electron

Status: ✅

Electron 12.x is the current stable release.

<a name="rule-remote"></a>

### (Historical) Do not use the Remote module

Status: ✅

The [remote](https://www.electronjs.org/docs/api/remote) was disabled by default in Electron 10, and deprecated in Electron 12. It remains explicitly disabled.

## Additional security measures

The following changes are not part of the official checklist.

<a name="sandbox"></a>

### Sandbox the renderer process

The `sandbox` option prevents the renderer processfrom accessing Node or Electron APIs. It is enabled globally as well as in for browser window.

Learn more: https://www.electronjs.org/docs/api/sandbox-option.

<a name="disable-new-window"></a>

### Further prevent new window creation

The (recently deprecated) `new-window` event does not automatically prevent a new window from being opened by middle-clicking it. The app uses both `disableBlinkFeatures: "Auxclick"` and `setWindowOpenHandler` to prevent this.

Learn more: https://www.electronjs.org/docs/api/window-open.

<a name="disable-session-cache"></a>

### Disable the session cache

The app creates a custom `Session` instead of using the default. The persistent session has its cache disabled to prevent network resources from being saved to disk, where they can be read in plain text. This is especially important on Windows, where app data, including the cache is saved in `%AppData%\Roaming`.

The custom session can be made more private by removing the `persist:` prefix, in which case nothing will be written to disk, including `localStorage`. The user experience would then be similar to using Chrome in Incognito mode.

Learn more: https://www.electronjs.org/docs/api/session#sessionfrompartitionpartition-options.

### Restrict dev tools access in the packaged app

Easy acess to the web inspector is necessary during development, but it can be used as an attack vector in production. Users can be tricked into executing code which would expose their personal information or compromise the functionality of the app. To prevent this from happening, dev tools are disabled in the packaged app.

### Use `strict` TypeScript setting

The app prevents JavaScript error at runtime by setting `strict` in `tsconfig.json`.

## Disclaimer

All code and documentation in this repository is intended for educational purposes, and is provided as-is. Use at your own risk. 1Password and contributors are not responsible for data loss, security incidents, or other damages incurred through the use of this software, or through the application of any advice provided in the documentation.

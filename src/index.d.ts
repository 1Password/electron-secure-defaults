import type { RendererApi } from "./preload";

declare global {
  interface Window {
    api: typeof RendererApi;
  }
}

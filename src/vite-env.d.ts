/// <reference types="vite/client" />
declare module "@tailwindcss/vite" {
  import type { PluginOption } from "vite";
  interface TailwindViteOptions {
    [key: string]: unknown;
  }
  export default function tailwindcss(options?: TailwindViteOptions): PluginOption;
}

// Vite's built-in `vite/client` types only declare lowercase image extensions
// (e.g. '*.jpg'). A few asset files in this repo were saved with an uppercase
// .JPG extension, and TypeScript module declarations are case-sensitive, so
// those imports fail to typecheck even though they work fine at build/runtime
// (Vite itself resolves file imports case-insensitively on most filesystems).
// This declares the uppercase variants so `tsc --noEmit` passes too.
declare module "*.JPG" {
  const src: string;
  export default src;
}
declare module "*.JPEG" {
  const src: string;
  export default src;
}
declare module "*.PNG" {
  const src: string;
  export default src;
}

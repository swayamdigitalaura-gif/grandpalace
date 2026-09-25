// vite/client only declares lowercase image extensions; a few camera photos
// in src/assets keep their original uppercase .JPG/.JPEG names. Vite itself
// imports them fine — this just gives TypeScript the same module type.
declare module "*.JPG" {
  const src: string;
  export default src;
}
declare module "*.JPEG" {
  const src: string;
  export default src;
}

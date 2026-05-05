// Declare CSS side-effect imports for non-module CSS files
// (e.g. import './globals.css' or import '@xyflow/react/dist/style.css')
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

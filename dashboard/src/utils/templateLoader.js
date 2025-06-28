/**
 * Dynamic template loader.
 * Usage: const Mod = await loadTemplate("homepage", 2);
 *        <Mod tokens={siteTokens} />
 */
export async function loadTemplate(page, v) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – we accept runtime path
  const mod = await import(
    /* @vite-ignore */ `../templates/${page}/v${v}/index.jsx`
  );
  return mod.default;
}
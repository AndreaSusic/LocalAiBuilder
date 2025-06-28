/**
 * Dynamic template loader.
 * Usage: const Mod = await loadTemplate("homepage", 2);
 *        <Mod tokens={siteTokens} />
 */

// Import all templates statically to ensure they're available
import HomepageV1 from '../templates/homepage/v1/index.jsx';
import HomepageV2 from '../templates/homepage/v2/index.jsx';
import HomepageV3 from '../templates/homepage/v3/index.jsx';

const templateRegistry = {
  homepage: {
    1: HomepageV1,
    2: HomepageV2,
    3: HomepageV3,
  }
};

export async function loadTemplate(page, v) {
  const template = templateRegistry[page]?.[v];
  if (!template) {
    throw new Error(`Template ${page} v${v} not found`);
  }
  return template;
}
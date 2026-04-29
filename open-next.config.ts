// @opennextjs/cloudflare — minimal vs optional:
// - Default uses R2 incremental cache (requires NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc).
// - To opt out of R2 caching, replace `incrementalCache` per OpenNext Cloudflare docs.
// - OpenNext re-bundles Next’s traced server output with esbuild; harmless analyzer notes (e.g. minified
//   `typeof` / duplicate keys in dependency chunks) come from that graph, not from first-party app code.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
});

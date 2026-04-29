// @opennextjs/cloudflare — minimal vs optional:
// - Default uses R2 incremental cache (requires NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc).
// - To opt out of R2 caching, replace `incrementalCache` per OpenNext Cloudflare docs.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
});

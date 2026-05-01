export type { DeploymentRuntimeOptions, DeploymentTarget } from './deploymentTarget'
/** Payload DB/runtime wiring — Local API singleton, adapter resolution, deployment detection.
 *
 * Internal utilities only. Prefer deep imports:
 * - `@root/plugins/payload-runtime/getPayload` (main entry point)
 * - `@root/plugins/payload-runtime/deploymentTarget` (for types)
 */
export { getPayload } from './getPayload'

/** `@zubricks/plugin-google-analytics` — widget list shown in admin. */
export const googleAnalyticsConfig = {
  enabledWidgets: ['analytics-overview', 'top-pages', 'active-users', 'channel-groups'] as (
    | 'active-users'
    | 'analytics-overview'
    | 'channel-groups'
    | 'top-pages'
  )[],
}

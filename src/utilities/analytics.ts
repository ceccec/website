import { resolveGlobalField } from '@root/lib/resolveGlobalField'

type AnalyticsIds = {
  facebookPixelId?: string
  gaMeasurementId?: string
}

export function analyticsEvent(event: string, value?: unknown, ids?: AnalyticsIds): void {
  const gaMeasurementId = resolveGlobalField(
    ids?.gaMeasurementId,
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  )
  const pixelID = resolveGlobalField(ids?.facebookPixelId, process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID)

  const Window = window as any // eslint-disable-line @typescript-eslint/no-explicit-any

  if (gaMeasurementId && typeof Window.gtag === 'function') {
    Window.gtag('event', event, value)
  }

  if (pixelID) {
    void import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        if (event === 'page_view') {
          ReactPixel.pageView()
        } else {
          ReactPixel.track(event, value)
        }
      })
  }
}

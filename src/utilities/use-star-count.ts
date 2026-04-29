import React from 'react'

export const useStarCount = (): string | undefined => {
  const [starCount, setStarCount] = React.useState<string | undefined>()

  React.useEffect(() => {
    const getStarCount = async (): Promise<void> => {
      const raw: unknown = await fetch('/api/star-count', { next: { revalidate: 900 } }).then(
        (res) => res.json(),
      )
      const totalStars =
        typeof raw === 'object' &&
        raw !== null &&
        'totalStars' in raw &&
        typeof (raw as { totalStars: unknown }).totalStars === 'number'
          ? (raw as { totalStars: number }).totalStars
          : null
      if (totalStars != null) {
        if (totalStars > 1000) {
          setStarCount((totalStars / 1000).toFixed(1) + 'k')
        } else {
          setStarCount(totalStars.toLocaleString())
        }
      }
    }

    void getStarCount()
  }, [])

  return starCount
}

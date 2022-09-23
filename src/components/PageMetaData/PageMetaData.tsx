import { Helmet } from 'react-helmet'

interface PageMetaDataProps {
  title: string
  description: string
  noIndex: boolean
}

export function PageMetaData({ title: pageTitle, description, noIndex }: PageMetaDataProps) {
  return (
    <Helmet>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  )
}

import { Helmet } from 'react-helmet'

import { useEnvironment } from '../../hooks/useEnvironment'

interface PageMetaDataProps {
  title?: string
  description?: string
}

export function PageMetaData({ title = 'Swapr', description }: PageMetaDataProps) {
  const { isProduction } = useEnvironment()
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {!isProduction && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  )
}

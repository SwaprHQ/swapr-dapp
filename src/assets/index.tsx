import { exportAllImagesFilesFromRelativePath } from '../utils'

export const imagesBase = exportAllImagesFilesFromRelativePath(require.context('./images', false, /\.(png|jpe?g|svg)$/))
export const imagesAnimations = exportAllImagesFilesFromRelativePath(
  require.context('./images/animations', false, /\.(png|jpe?g|svg)$/)
)
export const imagesBlog = exportAllImagesFilesFromRelativePath(
  require.context('./images/blog', false, /\.(png|jpe?g|svg)$/)
)

export const imagesFeatures = exportAllImagesFilesFromRelativePath(
  require.context('./images/features', false, /\.(png|jpe?g|svg)$/)
)
export const imagesLogos = exportAllImagesFilesFromRelativePath(
  require.context('./images/logos', false, /\.(png|jpe?g|svg)$/)
)
export const imagesTimelineAssets = exportAllImagesFilesFromRelativePath(
  require.context('./images/timeline-assets', false, /\.(png|jpe?g|svg)$/)
)
export const svg = exportAllImagesFilesFromRelativePath(require.context('./svg', false, /\.(png|jpe?g|svg)$/))

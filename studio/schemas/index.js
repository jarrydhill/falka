import boat from './boat'
import brandSettings from './brandSettings'
import pillar from './pillar'
import layoutOption from './layoutOption'
import signatureFeature from './signatureFeature'
import configOption from './configOption'

export const schemaTypes = [
  boat,
  brandSettings,
  // Inline object types referenced by boat / brandSettings:
  pillar,
  layoutOption,
  signatureFeature,
  configOption,
]

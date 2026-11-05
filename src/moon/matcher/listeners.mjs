import { cableRecords } from './listener-data/cables.mjs'
import { fitRules } from './listener-data/fit-rules.mjs'
import { modelRecords } from './listener-data/models.mjs'

const productBase = 'https://www.moon-audio.com/products/'

// Revisions stay separate across search, pricing and portable fit links.
function modelId(brand, model) {
  return (brand + ' ' + model)
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/æ/gi, 'ae')
    .replace(/\+/g, ' plus ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const listenerCableSpecs = Object.fromEntries(
  Object.values(cableRecords).map(({ handle, name, plugs }) => [
    handle,
    { name, plugs, source: productBase + handle },
  ]),
)

export const listeners = modelRecords.map(
  ({ rule, brand, model, listing, ...record }) => {
    const { cables, ...defaults } = fitRules[rule]
    const cableHandles = []
    const earOptions = {}
    for (const [code, exactSelector] of Object.entries(cables)) {
      const { handle } = cableRecords[code]
      cableHandles.push(handle)
      if (exactSelector) earOptions[handle] = exactSelector
    }
    return {
      id: modelId(brand, model),
      brand,
      model,
      ...defaults,
      ...record,
      ...(record.source && defaults.source && record.source !== defaults.source
        ? { fitSource: defaults.source }
        : {}),
      ...(listing ? { listing: productBase + listing } : {}),
      cables: cableHandles,
      earOptions,
    }
  },
)

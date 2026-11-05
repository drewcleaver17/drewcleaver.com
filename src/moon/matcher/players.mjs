// Outputs are cable connections, not a claim about drive power or amplifier topology.
// Only headphone-level sockets belong here. Different revisions can share a store listing.
import { catalogPlayers } from './player-data/catalogPlayers.mjs'
import { referencePlayers } from './player-data/referencePlayers.mjs'

const plugLabels = {
  '2.5': '2.5 mm balanced headphone jack',
  '3.5': '3.5 mm stereo headphone jack',
  '4.4': '4.4 mm headphone jack',
  '6.35': '6.35 mm (¼-inch) stereo headphone jack',
  xlr4: '4-pin XLR headphone socket',
}

export const players = [...catalogPlayers, ...referencePlayers].map((record) => {
  const { brand, model, handle, ports, labels, aliases, note } = record
  const listing = handle && 'https://www.moon-audio.com/products/' + handle
  const id = (brand + '-' + model)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-$/g, '')
  return {
    id, brand, model,
    ...(aliases && { aliases }),
    ...(note && { note }),
    ...(listing && { listing }),
    source: record.source || listing,
    outputs: ports.map((plug) => ({ plug, label: labels?.[plug] || plugLabels[plug] })),
  }
})

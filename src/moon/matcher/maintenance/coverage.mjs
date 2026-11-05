// Run from the checkout with Node 22.13+. Catalog listings, named revisions,
// retail variants and compatible end-to-end configurations are different units.
import { pathToFileURL } from 'node:url'
import { gear, connections, counts, portConnections } from '../directory.mjs'
import { inventory, inventoryInfo } from '../inventory.mjs'
import { listeners } from '../listeners.mjs'
import { players } from '../players.mjs'
import { allOffers } from '../offers.mjs'
import { outputChoices, emptySelection } from '../engine.mjs'

export function coverage() {
  const pricedListeners = new Set(),
    pricedHandles = new Set(),
    nativeVariants = new Set(),
    nativeListeners = new Set()
  let configurations = 0
  for (const offer of allOffers()) {
    configurations++
    pricedListeners.add(offer.listener)
    pricedHandles.add(offer.handle)
    nativeVariants.add(offer.variant)
    if (offer.kind === 'variant') nativeListeners.add(offer.listener)
  }
  const headphones = inventory.filter((p) =>
    ['headphones', 'earphones'].includes(p.category),
  )
  const sourceCatalog = inventory.filter((p) =>
    ['amplifiers', 'sources', 'players'].includes(p.category),
  )
  const inventoryLookup = new Set(inventory.map((x) => x.url))
  const listenerUrls = new Set(listeners.map((l) => l.listing))
  const playerUrls = new Set(players.map((p) => p.listing))
  const pricedUrls = new Set(
    listeners.filter((l) => pricedListeners.has(l.id)).map((l) => l.listing),
  )
  const systemUrls = new Set()
  const systemIds = new Set()
  for (const row of connections.values()) {
    for (const id of [row.fromId, row.toId]) {
      systemIds.add(id)
      const url = gear.get(id).listing
      if (inventoryLookup.has(url)) systemUrls.add(url)
    }
  }
  const matchedPlayers = players.filter(
    (p) => outputChoices({ ...emptySelection(), a: p.id }).length,
  )
  return {
    asOf: inventoryInfo.date,
    publicProductsReviewed: inventoryInfo.productsScanned,
    catalogElectronics: inventory.length,
    catalogWithDocumentedDragonOrHeadphoneOutput: counts.documentedCatalog,
    catalogListenerListings: headphones.length,
    catalogListenerListingsRecognized: headphones.filter((p) =>
      listenerUrls.has(p.url),
    ).length,
    catalogListenerListingsWithPricedDragon: headphones.filter((p) =>
      pricedUrls.has(p.url),
    ).length,
    catalogSourceListings: sourceCatalog.length,
    catalogSourceListingsReviewed: sourceCatalog.filter((p) =>
      playerUrls.has(p.url),
    ).length,
    catalogSourceListingsWithHeadphoneOutputs: new Set(
      matchedPlayers
        .filter((p) => sourceCatalog.some((q) => q.url === p.listing))
        .map((p) => p.listing),
    ).size,
    directoryRecords: gear.size,
    exactListenerModelsOrRevisions: listeners.length,
    pricedListenerModelsOrRevisions: pricedListeners.size,
    sourceModelsWithHeadphoneOutputs: matchedPlayers.length,
    selectableModelHeadphoneJacks: matchedPlayers.reduce(
      (n, p) => n + p.outputs.length,
      0,
    ),
    pricedDragonProducts: pricedHandles.size,
    distinctRetailVariants: nativeVariants.size,
    pricedConfigurations: configurations,
    listenersWithCompleteNativeVariant: nativeListeners.size,
    systemCatalogListings: systemUrls.size,
    systemModels: systemIds.size,
    directedModelPairs: counts.systems,
    directedPortRoutes: connections.size,
    genericPortRoutes: portConnections.size,
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(JSON.stringify(coverage(), null, 2))
}

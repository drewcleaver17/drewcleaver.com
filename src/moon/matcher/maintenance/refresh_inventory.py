#!/usr/bin/env python3
"""Create a reviewable discovery snapshot from Moon Audio's public US listings.

Run: python3 src/moon/matcher/maintenance/refresh_inventory.py > /tmp/moon-inventory.mjs
Review the stdout snapshot against inventory.mjs before replacing it. Changes here
only affect discovery. Re-check all linked fit records if a title/revision, variant,
or handle changes. Neither an item in a collection nor a retailer tag proves a fit.

No account, Shopify key or write endpoint is used. Requires Python 3 and curl.
"""
import argparse
from collections import Counter
from datetime import date
import html
import json
import re
import subprocess
import sys
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ORIGIN = 'https://www.moon-audio.com'
PRODUCTS = ORIGIN + '/products.json'
SITEMAP = ORIGIN + '/sitemap.xml'
NON_GEAR = 'Accessories, replacement/DIY parts, cartridges, cables, adapters and services'


def fetch(url):
    # Restrict both the sitemap and public data calls to the merchant's HTTPS host.
    if (urlsplit(url).scheme, urlsplit(url).netloc) != ('https', 'www.moon-audio.com'):
        raise ValueError(f'Unexpected merchant URL: {url}')
    return subprocess.check_output([
        'curl', '--fail', '--silent', '--show-error', '--compressed',
        '--max-time', '75', '--retry', '2', url,
    ])


def listed_handles():
    indexes = [node.text for node in ET.fromstring(fetch(SITEMAP)).findall('{*}sitemap/{*}loc')
               if urlsplit(node.text).path.startswith('/sitemap_products_')]
    if not indexes:
        raise ValueError('Expected a product sitemap')
    result = set()
    for index in indexes:
        for node in ET.fromstring(fetch(index)).findall('{*}url/{*}loc'):
            if node.text.startswith(ORIGIN + '/products/'):
                result.add(node.text.removeprefix(ORIGIN + '/products/'))
    if not result:
        raise ValueError('Empty product sitemap')
    return result


def public_products():
    products = {}
    for page in range(1, 301):
        batch = json.loads(fetch(f'{PRODUCTS}?limit=250&page={page}'))['products']
        if not isinstance(batch, list):
            raise ValueError('Malformed product feed')
        if not batch:
            if not products:
                raise ValueError('Empty product feed')
            return products
        for product in batch:
            handle = product['handle']
            if not re.fullmatch(r'[a-z0-9][a-z0-9_-]*', handle) or handle in products:
                raise ValueError(f'Malformed or repeated product handle on page {page}: {handle}')
            products[handle] = product
    raise ValueError('Pagination limit reached without an empty page')


EXCLUDED_TITLE = re.compile(
    r'\b(cases?|earpads?|stands?|stabilizer|alignment|headshell|'
    r'cables?|isolation (?:base|platform|feet|stand)|cartridge|ear cushions?|'
    r'carpet (?:spikes|disks?)|remote control|car coasters?|sticker pack|warranty|'
    r'storage hanger|binding post|stylus pen|adapters?)\b', re.I)

# These retail records carry broad/overlapping merchandising tags. The actual
# product designation determines discovery category; it never grants compatibility.
CATEGORIES_BY_HANDLE = {
    'ifi-go-pod-max-wearable-lossless-hd-bluetooth-dac-and-headphone-amp': 'amplifiers',
    'ifi-omni-usb-optical-isolation-zero-disruption': 'other',
    'ss-1-pro-audio-grade-network-switch': 'other',
    'si-1-audio-grade-network-isolator': 'other',
    'su-1-isolated-usb-switcher-with-linear-psu-moon-audio': 'other',
    'aurender-nh10-audiophile-network-switch': 'other',
    'usb-multiplexer-for-suzi-hugo-2': 'other',
    'pd10-cradle': 'other',
    'tronsmart-usb-charger': 'other',
    'hypsos-hybrid-power-supply': 'other',
    'hypsos-dual-amplifier': 'other',
    'quartet-fpga-upscaler': 'sources',
    'chord-hugo-m-scaler': 'sources',
    'chord-2yu-digital-interface': 'sources',
    'bricasti-m12-source-controller': 'sources',
    'naim-uniti-atom-headphone-amp-dac-and-streamer': 'amplifiers',
    'ak-hb1-portable-bluetooth-dac-amp': 'amplifiers',
    'nad-m33-v2-bluos-streaming-dac-amplifier': 'amplifiers',
    'nad-m33-bluos-streaming-dac-amplifier': 'amplifiers',
    'masters-m66-bluos-streaming-dac-preamplifier': 'amplifiers',
}

EARPHONE_TAGS = {'Audio Gear Type:IEM', 'Headphone Fit:In-Ear', 'Earphones and IEMs'}
HEADPHONE_TAGS = {'Audio Gear Type:Headphone', 'Audio Gear Type:Headphones',
                  'Audio Gear Type:Headphone System', 'Headphone Fit:Over-Ear', 'Headphone Fit:On-Ear'}
POWER_TAGS = {'Audio Gear Type:Power Conditioner', 'DAC Type:Master Clock'}
SOURCE_TAGS = {'Audio Gear Type:DAC', 'Audio Gear Type:Turntable', 'Audio Gear Type:Music Player',
               'Audio Gear Type:CD Player', 'Audio Gear Type:Streaming Media Player',
               'Player Type:Streaming', 'Player Type:Server'}


def classify(product):
    handle = product['handle']
    if handle in CATEGORIES_BY_HANDLE:
        return CATEGORIES_BY_HANDLE[handle]
    title = product['title']
    tags = set(product['tags'])
    if (product['product_type'] in ('Audio Cables', 'Insurance') or
            'Audio Gear Type:DIY' in tags or 'Audio Gear Type:Adapter' in tags or
            'Audio Gear Type:Vacuum Tube' in tags or EXCLUDED_TITLE.search(title)):
        return None
    if EARPHONE_TAGS & tags:
        return 'earphones'
    if HEADPHONE_TAGS & tags or product['product_type'] == 'Headphone':
        return 'headphones'
    if 'Player Type:DAP' in tags:
        return 'players'
    if any(t.startswith('Speaker Type:') for t in tags) or {'Speakers', 'Audio Gear Type:Speaker'} & tags:
        return 'speakers'
    if (tags & POWER_TAGS or 'Component:Measurement Mic' in tags or
            re.search(r'\b(?:network switch|network isolator|power strip|power supply)\b', title, re.I)):
        return 'other'
    if 'Audio Gear Type:Cartridge' in tags or 'Audio Gear Type:Accessory' in tags:
        return None
    if re.search(r'\b(?:headphone (?:amp|amplifier)|integrated amplifier|power amplifier)\b', title, re.I):
        return 'amplifiers'
    if re.search(r'\b(?:streamer|music server|CD player|turntable|network player|'
                 r'network transport|DAC/Preamp|streaming DAC|analog converter|SACD)\b', title, re.I):
        return 'sources'
    if (any(t.startswith('Amplifier Type:') for t in tags) or
            {'Audio Gear Type:Preamplifier', 'Audio Gear Type:Amplifier'} & tags):
        return 'amplifiers'
    if tags & SOURCE_TAGS:
        return 'sources'
    return None


def title_and_brand(product):
    clean = lambda s: ' '.join(html.unescape(s).replace('\u200d', '').replace('\ufeff', '').split())
    title = clean(product['title']).removesuffix(' | Moon Audio')
    brand = clean(product['vendor'])
    # The merchant headline currently contains a brand typo. Its handle, vendor
    # field, two variant SKUs and manufacturer's model all identify Naim.
    if product['handle'] == 'naim-uniti-atom-headphone-amp-dac-and-streamer' and title.startswith('NAD '):
        title = 'Naim ' + title[4:]
    return title, brand


def render(products, sitemap_handles, checked_on, report_excluded=False):
    missing = sitemap_handles - set(products)
    if missing:
        raise ValueError('Sitemap lists products missing from the feed: ' + ', '.join(sorted(missing)))
    rows = []
    for handle, product in products.items():
        category = classify(product)
        if category:
            title, brand = title_and_brand(product)
            if not title or not brand:
                raise ValueError(f'Missing product identity: {handle}')
            rows.append([handle, title, brand, category])
        elif report_excluded:
            print(f'Excluded: {product["vendor"]} | {product["title"]} | {handle}', file=sys.stderr)
    rows.sort(key=lambda r: (r[2].casefold(), r[1].casefold(), r[0]))
    if not rows:
        raise ValueError('No discoverable electronics')
    counts = dict(sorted(Counter(r[3] for r in rows).items()))
    info = dict(date=checked_on, sources=[PRODUCTS, SITEMAP],
                productsScanned=len(products), sitemapProducts=len(sitemap_handles),
                listings=len(rows), counts=counts, exclusions=NON_GEAR,
                unit='Public US product listings; a listing may contain several editions or options.')
    print('// Generated from public product identities. See maintenance/refresh_inventory.py.')
    print('export const inventoryInfo = ' + json.dumps(info, ensure_ascii=False, indent=2))
    print('\nconst rows = [')
    for row in rows:
        print('  ' + json.dumps(row, ensure_ascii=False) + ',')
    print(']')
    print('\nexport const inventory = rows.map(([handle, title, brand, category]) => ({')
    print('  handle, title, brand, category, url: `https://www.moon-audio.com/products/${handle}`,')
    print('}))')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--review-exclusions', action='store_true',
                        help='List every excluded retailer product to stderr for review.')
    args = parser.parse_args()
    # Emit nothing until both reads and all reconciliation checks succeed.
    render(public_products(), listed_handles(), date.today().isoformat(), args.review_exclusions)

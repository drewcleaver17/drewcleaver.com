#!/usr/bin/env python3
"""Prepare proposed discovery and pricing data outside the checkout for human review."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from contextlib import redirect_stdout
from datetime import date
from io import StringIO
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from refresh_inventory import ORIGIN, fetch, listed_handles, public_products, render

MATCHER = Path(__file__).resolve().parent.parent


def prepare(destination):
    destination = destination.resolve()
    checkout = MATCHER.parents[2]
    if destination.is_relative_to(checkout) or destination.exists():
        raise ValueError('Use a new directory outside the checkout.')
    checked = date.today().isoformat()
    products = public_products()
    index = StringIO()
    with redirect_stdout(index):
        render(products, listed_handles(), checked)
    # Start from the reviewed cables instead of turning an arbitrary new product
    # into an approved fit based on its tags. New fittings need their own evidence.
    old_book = json.loads((MATCHER / 'offer-data/pricebook.json').read_text())
    handles = old_book['products']
    if not handles.keys() <= products.keys():
        raise ValueError('A previously reviewed cable was removed or renamed. Review the product identity first.')
    with tempfile.TemporaryDirectory() as scratch:
        temp = Path(scratch)
        forms = temp / 'forms'
        forms.mkdir()
        (temp / '1.json').write_text(json.dumps({'products': list(products.values())}))
        def get_form(handle):
            (forms / (handle + '.html')).write_bytes(fetch(ORIGIN + '/products/' + handle))
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(get_form, handles))
        subprocess.run(['node', str(MATCHER / 'listener-data/check.mjs'), '--snapshot', str(forms)], check=True)
        candidate = temp / 'pricebook.json'
        subprocess.run([sys.executable, str(MATCHER / 'offer-data/refresh.py'), '--feed-dir', str(temp),
                        '--html-dir', str(forms), '--checked', checked, '--output', str(candidate)], check=True)
        new_book = json.loads(candidate.read_text())
        if handles.keys() != new_book['products'].keys():
            raise ValueError('At least one previously published price failed verification. Review the affected retailer forms.')
        destination.mkdir(parents=True)
        (destination / 'inventory.mjs').write_text(index.getvalue())
        (destination / 'pricebook.json').write_bytes(candidate.read_bytes())
    print('Candidates ready at', destination)
    print('Review model revisions, fitting labels, changes in prices and coverage before replacing either snapshot.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    prepare(parser.parse_args().destination)

"""Extract a proposed US pricebook from Moon's public retail feed and product forms.

Supply the numbered .json pages of /products.json?limit=250&page=N and a
directory containing the corresponding /products/HANDLE HTML as HANDLE.html.
Write to a separate candidate file, test, and review the diff before replacing
the published snapshot. No storefront write, cart request or network at runtime.
"""
import argparse
from datetime import date
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
import json
from pathlib import Path
import re


def clean(value):
    return ' '.join(value.split())


def money(amount):
    number = Decimal(amount)
    if not number.is_finite() or number < 0 or number * 100 != int(number * 100):
        raise ValueError('Unexpected merchandise amount')
    return int(number) if number == int(number) else float(number)


def length(value):
    match = re.fullmatch(r'(\d+)\s*(foot|ft|")', value, re.I)
    if not match or int(match[1]) < 1:
        raise ValueError('Unsupported length ' + value)
    return match[1] + (' in' if match[2] == '"' else ' ft')


def plug(value):
    # Single-ended TRS, balanced TRRS and full-size male XLR are different
    # interfaces. Unusual wiring, a mini-XLR adapter, dual outputs, and female
    # sockets do not become a match by sharing a diameter or a pin count.
    text = re.sub(r'^Premolded\s+', '', value, flags=re.I).lower()
    if any(term in text for term in ('female', 'mytek', 'adapter systems', 'dual ')):
        return None
    if re.match(r'^2\.5\s*mm\s+trrs\b', text):
        return '2.5'
    if re.match(r'^3\.5\s*mm\s+trs\b', text) and 'balanced' not in text:
        return '3.5'
    if re.match(r'^4\.4\s*mm\s+trrrs\b', text):
        return '4.4'
    if text.startswith(('1/4-in ', '1/4" ', '6.35mm ')) and 'trs' in text:
        return '6.35'
    if re.match(r'^4[ -]pin', text) and 'xlr' in text and 'mini' not in text:
        return 'xlr4'
    return None


class ProductForm(HTMLParser):
    """Collect only controls owned by the main form for the exact product ID."""
    def __init__(self, product):
        super().__init__(convert_charrefs=True)
        self.suffix = '__main-' + str(product['id'])
        self.form_ids = set()
        self.form_owner = ''
        self.selections = {}
        self.inputs = []
        self.labels = {}
        self.label = None
        self.select = None
        self.option = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        name = attrs.get('name', '')
        if tag == 'form':
            self.form_owner = attrs.get('id', '')
        owner = attrs.get('form', self.form_owner)
        is_main = owner.startswith('product-form-') and owner.endswith(self.suffix)
        form_id = attrs.get('id', '')
        if tag == 'form' and form_id.startswith('product-form-') and form_id.endswith(self.suffix) and attrs.get('action') == '/cart/add':
            self.form_ids.add(attrs['id'])
        if tag == 'label' and attrs.get('for'):
            self.label = attrs['for']
            self.labels.setdefault(self.label, '')
        if tag == 'select':
            self.select = None
            self.option = None
            if is_main and (name == 'id' or name.startswith('properties[')):
                if name in self.selections:
                    raise ValueError('Duplicate form selector ' + name)
                self.select = self.selections[name] = []
        elif tag == 'option' and self.select is not None:
            self.option = [attrs, '']
            self.select.append(self.option)
        elif tag in ('input', 'textarea') and is_main and name.startswith('properties['):
            self.inputs.append(attrs)

    def handle_data(self, data):
        if self.label is not None:
            self.labels[self.label] += data
        if self.option is not None:
            self.option[1] += data

    def handle_endtag(self, tag):
        if tag == 'label':
            self.label = None
        if tag == 'form':
            self.form_owner = ''
        if tag in ('option', 'select'):
            self.option = None
        if tag == 'select':
            self.select = None


def inspect_product(product, html):
    if not re.search(r'Shopify\.currency\s*=\s*\{\s*"active"\s*:\s*"USD"', html):
        raise ValueError('Cannot confirm US dollar retail form')
    form = ProductForm(product)
    form.feed(html)
    if len(form.form_ids) != 1 or 'id' not in form.selections:
        raise ValueError('Cannot identify primary purchase form')

    result = {}
    for item in form.inputs:
        field_type = item.get('type')
        if (field_type == 'hidden' and item['name'] == 'properties[Notice]'
                and item.get('value') == 'Open Box/Sale Items are Final Sale'):
            result['policy'] = 'Sale cable · final sale'
            continue
        if field_type == 'hidden' and item['name'] in {
            'properties[_addon_list]', 'properties[_addon_ids]', 'properties[_addon_total]'
        } and not item.get('value'):
            continue
        if field_type == 'text' and 'required' not in item and not item.get('value'):
            continue
        if field_type == 'checkbox' and 'checked' not in item and 'required' not in item:
            continue
        raise ValueError('Unmodeled property ' + item['name'])
    # A workshop-level or family default could quote the wrong surcharge.
    # Only expose the checkbox if the visible label, property value and amount
    # used in the storefront calculation all agree for this exact product.
    rush = [i for i in form.inputs if i['name'] == 'properties[**RUSH PROCESSING]']
    if len(rush) == 1:
        item = rush[0]
        is_opt_in = (item.get('type') == 'checkbox' and
                     not any(key in item for key in ('checked', 'required', 'disabled')))
        stated = re.fullmatch(r'\(\$(\d+(?:\.\d{1,2})?)\)', item.get('value', ''))
        visible = re.search(r'RUSH PROCESSING:\s*\$(\d+(?:\.\d{1,2})?)', form.labels.get(item.get('id'), ''))
        amount = item.get('data-price', '')
        if is_opt_in and stated and visible and re.fullmatch(r'\d+(?:\.\d{1,2})?', amount):
            if 0 < money(amount) == money(stated[1]) == money(visible[1]):
                result['rushUsd'] = money(amount)

    native_display = {
        item['value']: clean(text) for item, text in form.selections.pop('id')
        if 'value' in item and 'disabled' not in item
    }
    for name, options in form.selections.items():
        label = name.removeprefix('properties[').removesuffix(']')
        if label.startswith('Headphone Connection'):
            end = 'ear'
        elif label == 'Amplifier Connection Options':
            end = 'amp'
        else:
            raise ValueError('Unmodeled property selector ' + name)
        field = {'label': label, 'choices': {}}
        for attrs, text in options:
            if not attrs.get('value') or 'disabled' in attrs:
                continue
            key = clean(attrs.get('data-value', ''))
            if not key or key != clean(text) or not attrs.get('data-price'):
                raise ValueError('Unpriced modifier option ' + clean(text))
            # The shop adds each selected option's data-price to the native
            # price. Some labels also print the surcharge; never add it twice.
            cost = money(attrs['data-price'])
            amount_label = re.search(r'\(\$([\d.]+)\)$', attrs['value'])
            if amount_label and money(amount_label[1]) != cost:
                raise ValueError('Conflicting modifier amounts')
            if end == 'ear':
                field['choices'][key] = cost
            elif (family := plug(key)):
                field['choices'][key] = {'plug': family, 'usd': cost}
        if not field['choices'] or end in result:
            raise ValueError('Unsupported or duplicate modifier ' + name)
        result[end] = field

    native = {}
    for option in product['options']:
        name = option['name']
        if name in ('Length', 'Cable Length', 'Headphone Cable'):
            key = 'length'
        elif name.startswith(('Amplifier ', 'Headphone Amplifier ')):
            key = 'amp'
        elif name.startswith(('Headphone Connection', 'IEM Connection', 'IEM Option')):
            key = 'ear'
        else:
            raise ValueError('Unmodeled native option ' + name)
        if key in native or key in result:
            raise ValueError('Overlapping choices for ' + key)
        native[key] = 'option' + str(option['position'])
    if 'length' not in native or ('amp' not in native and 'amp' not in result):
        raise ValueError('Missing length or amplifier end')

    if result.get('policy') and ('ear' in result or 'amp' in result):
        raise ValueError('Review sale item with on-page modifiers')
    variants = []
    for variant in product['variants']:
        if not variant['available']:
            continue
        compare_price = variant.get('compare_at_price')
        discounted = bool(compare_price and money(compare_price) > money(variant['price']))
        if discounted != ('policy' in result):
            # A discounted price and a precise sale policy must travel together.
            continue
        identifier = str(variant['id'])
        title, separator, price = native_display.get(identifier, '').rpartition(' - $')
        if not separator or clean(variant['title']) != title or money(price.replace(',', '')) != money(variant['price']):
            raise ValueError('Variant title or price differs between the feed and form: ' + identifier)
        row = {'id': identifier, 'length': length(variant[native['length']]), 'usd': money(variant['price'])}
        if 'ear' in native:
            row['ear'] = clean(variant[native['ear']])
        if 'amp' in native:
            amp_label = clean(variant[native['amp']])
            family = plug(amp_label)
            if not family:
                continue
            row.update(amp=amp_label, plug=family)
        variants.append(row)
    if not variants:
        raise ValueError('No available retail variants with a checked plug')
    result['variants'] = variants
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--feed-dir', type=Path, required=True)
    parser.add_argument('--html-dir', type=Path, required=True)
    parser.add_argument('--checked', required=True, help='ISO day evidence was fetched')
    parser.add_argument('--output', type=Path, required=True)
    opts = parser.parse_args()
    opts.checked = date.fromisoformat(opts.checked).isoformat()
    data = {'checked': opts.checked, 'products': {}}
    products = {}
    for file in opts.feed_dir.glob('*.json'):
        if file.stem.isdigit():
            for product in json.loads(file.read_text())['products']:
                products[product['handle']] = product
    # The HTML directory is an explicit scope selection. Fit eligibility for a
    # listener is separately reviewed in listeners.mjs before any price appears.
    failures = []
    for file in sorted(opts.html_dir.glob('*.html')):
        handle = file.stem
        if handle not in products or 'dragon' not in handle or products[handle]['product_type'] != 'Audio Cables':
            continue
        try:
            data['products'][handle] = inspect_product(products[handle], file.read_text())
        except (InvalidOperation, ValueError) as exc:
            failures.append((handle, str(exc)))
    previous_path = Path(__file__).with_name('pricebook.json')
    if previous_path.exists():
        previous = json.loads(previous_path.read_text())['products']
        attempted = {file.stem for file in opts.html_dir.glob('*.html')}
        for h in sorted(previous):
            if h not in attempted or h not in products:
                failures.append((h, 'Previously published product missing from supplied forms or feed'))
    if not data['products']:
        for handle, message in failures:
            print('Excluded', handle, '-', message)
        raise SystemExit('No valid products; no output written.')
    # One configuration per line keeps individual price/variant diffs reviewable.
    lines = ['{', '  "checked": "' + data['checked'] + '",', '  "products": {']
    blocks = []
    dump = lambda value: json.dumps(value, ensure_ascii=False)
    for handle, info in data['products'].items():
        lines_in = ['    ' + dump(handle) + ': {']
        for key in ('policy', 'rushUsd'):
            if key in info:
                lines_in.append('      ' + dump(key) + ': ' + dump(info[key]) + ',')
        for key in ('ear', 'amp'):
            if key in info:
                field = info[key]
                lines_in += ['      ' + dump(key) + ': {', '        "label": ' + dump(field['label']) + ',', '        "choices": {']
                lines_in.append(',\n'.join('          ' + dump(label) + ': ' + dump(price) for label, price in field['choices'].items()))
                lines_in += ['        }', '      },']
        lines_in += ['      "variants": [', ',\n'.join('        ' + dump(row) for row in info['variants']), '      ]', '    }']
        blocks.append('\n'.join(lines_in))
    lines += [',\n'.join(blocks), '  }', '}']
    opts.output.write_text('\n'.join(lines) + '\n')
    print('Catalog forms accepted:', len(data['products']), 'Available native rows:', sum(len(v['variants']) for v in data['products'].values()))
    for handle, message in failures:
        print('Excluded', handle, '-', message)


if __name__ == '__main__':
    main()

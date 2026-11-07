// Compatibility entry for the previous, ungrouped landing page.
import { startList } from './list-controller.mjs';

const root = document.querySelector('[data-north]');
if (root) startList(root);

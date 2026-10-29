// Self-check (no test runner in repo): node src/components/HomeFeed/headingRules.check.js
import assert from 'node:assert/strict';
import { DEFAULT_TEMPLATE_COPY as D } from '../../data/mockHomeFeed.js';
import { validateCopy, validateCopyEntry, measure, canDisableType, isRetirementFlagged } from './headingRules.js';

assert.deepEqual(validateCopy(D, D), {}, 'default copy must pass');

const longContext = { ...D[5], context: '{n} results that are the nearest possible options · Nearest options' };
assert.match(validateCopyEntry(longContext, D[5]).context, /max 38/);

const reordered = { ...D[1], title: 'New {asset} {config} in {location}' };
assert.equal(validateCopyEntry(reordered, D[1]).title, 'Tokens and their order are locked');

const dropped = { ...D[9], title: 'Below market' };
assert.equal(validateCopyEntry(dropped, D[9]).title, 'Tokens and their order are locked');

const longTag = { ...D[8], tag: '{n} agents enquired this week' };
assert.match(validateCopyEntry(longTag, D[8]).tag, /max 20/);

// Overflow-reducible title warns but is not rejected.
const t1 = measure('title', D[1].title);
assert.ok(t1.raw > 34 && t1.min <= 34);

assert.equal(canDisableType(18, 3.2), false);
assert.equal(canDisableType(18, 0.5), true);
assert.equal(canDisableType(9, 3.2), true);

assert.equal(isRetirementFlagged({ ctr: 0.44, impressions: 12880, daysBelow: 16 }), true);
assert.equal(isRetirementFlagged({ ctr: 0.48, impressions: 3920, daysBelow: 15 }), false);
assert.equal(isRetirementFlagged({ ctr: 0.62, impressions: 22105, daysBelow: 3 }), false);

console.log('headingRules: all checks passed');

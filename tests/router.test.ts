import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalPath } from '../src/lib/router.ts';

test('old house URLs rewrite to location URLs without losing the section', () => {
  assert.equal(canonicalPath('/manage-house'), '/manage-location');
  assert.equal(canonicalPath('/manage-house/people'), '/manage-location/people');
  assert.equal(canonicalPath('/manage-house/house-name'), '/manage-location/location-name');
  assert.equal(canonicalPath('/manage-house/house-picture'), '/manage-location/location-picture');
  assert.equal(canonicalPath('/bookings'), '/bookings');
});

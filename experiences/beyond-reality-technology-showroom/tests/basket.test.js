import test from 'node:test';
import assert from 'node:assert/strict';
import { BASKET_KEY, createBasket } from '../src/basket.js';

const ids = ['headphones', 'watch', 'camera'];
function memoryStorage(initial) {
  const values = new Map(initial ? [[BASKET_KEY, initial]] : []);
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test('basket quantities persist and merge with changes from another tab', () => {
  const store = memoryStorage();
  const first = createBasket(ids, () => store);
  const second = createBasket(ids, () => store);
  first.change('watch', 'add');
  second.change('camera', 'add');
  first.change('watch', 'add');
  assert.deepEqual(createBasket(ids, () => store).items, { watch: 2, camera: 1 });
  assert.equal(first.change('watch', 'less'), 1);
  assert.equal(first.change('watch', 'less'), 1);
  assert.equal(first.change('watch', 'remove'), 0);
  assert.deepEqual(createBasket(ids, () => store).items, { camera: 1 });
});

test('basket sanitizes stored values and enforces product and quantity limits', () => {
  const store = memoryStorage('{"watch":207,"headphones":1.3,"camera":-2,"unknown":30}');
  const basket = createBasket(ids, () => store);
  assert.deepEqual(basket.items, { watch: 99 });
  assert.equal(basket.change('watch', 'add'), 99);
  assert.equal(basket.change('unknown', 'add'), null);
  assert.equal(basket.change('camera', 'less'), 0);
  store.setItem(BASKET_KEY, '{bad');
  basket.refresh();
  assert.deepEqual(basket.items, {});
});

test('storage failure preserves a usable session basket', () => {
  const store = { getItem: () => '{}', setItem: () => { throw Error('storage unavailable'); } };
  const basket = createBasket(ids, () => store);
  assert.equal(basket.change('camera', 'add'), 1);
  assert.equal(basket.change('camera', 'add'), 2);
  assert.equal(basket.persistent, false);
  assert.deepEqual(basket.items, { camera: 2 });
});

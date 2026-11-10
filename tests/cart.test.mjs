import assert from 'node:assert/strict';
import test from 'node:test';
import { addItem, getCartSummary, removeItem, updateQuantity } from '../src/lib/cart.mjs';

const mug = { id: 1, title: 'Mug', price: 12.5 };
const book = { id: 2, title: 'Book', price: 8 };

test('adding an existing product increments its quantity', () => {
  const cart = addItem(addItem([], mug), mug);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
});

test('cart summary derives item count and total for multiple products', () => {
  const cart = addItem(addItem([], mug), book);
  assert.deepEqual(getCartSummary(cart), { itemCount: 2, total: 20.5 });
});

test('setting quantity to zero removes the item', () => {
  assert.deepEqual(updateQuantity(addItem([], mug), mug.id, 0), []);
});

test('invalid quantity leaves cart unchanged and remove targets one item', () => {
  const cart = addItem(addItem([], mug), book);
  assert.equal(updateQuantity(cart, mug.id, -1), cart);
  assert.deepEqual(removeItem(cart, mug.id), [{ ...book, quantity: 1 }]);
});
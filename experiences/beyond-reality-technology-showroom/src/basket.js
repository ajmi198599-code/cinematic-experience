export const BASKET_KEY = 'beyond-reality.technology-showroom.demo-basket.v1';
export const MAX_QUANTITY = 99;

export function createBasket(ids, storage = () => window.localStorage) {
  let items = {};
  let persistent = true;

  function read() {
    if (!persistent) return;
    try {
      const saved = JSON.parse(storage().getItem(BASKET_KEY) ?? '{}');
      items = Object.fromEntries(ids.flatMap(id => {
        const quantity = saved?.[id];
        return Number.isInteger(quantity) && quantity > 0 ? [[id, Math.min(quantity, MAX_QUANTITY)]] : [];
      }));
    } catch (error) {
      if (error instanceof SyntaxError) items = {};
      else persistent = false;
    }
  }

  read();
  return {
    get items() { return { ...items }; },
    get persistent() { return persistent; },
    refresh: read,
    change(id, action) {
      if (!ids.includes(id) || !['add', 'less', 'remove'].includes(action)) return null;
      read();
      const before = items[id] ?? 0;
      if (action === 'remove') delete items[id];
      else if (action === 'add') items[id] = Math.min(MAX_QUANTITY, before + 1);
      else if (before > 1) items[id] = before - 1;
      if (persistent) {
        try {
          storage().setItem(BASKET_KEY, JSON.stringify(items));
        } catch {
          persistent = false;
        }
      }
      return items[id] ?? 0;
    },
  };
}

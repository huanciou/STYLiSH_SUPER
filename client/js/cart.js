const STORAGE_KEY = "products";

function initCart() {
  let products = [];
  let listeners = new Set();
  const init = () => {
    const productsData = localStorage.getItem(STORAGE_KEY);
    if (productsData) {
      products = JSON.parse(productsData);
    }
  };
  const push = (product) => {
    products = [...products, product];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    listeners.forEach(notify => notify());
  };
  const get = () => {
    return products;
  };
  const update = (values) => {
    products = values;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    listeners.forEach(notify => notify());

  };
  const clear = () => {
    products = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    listeners.forEach(notify => notify());
  }

  const subscribe = (notifyFunction) => {
    listeners.add(notifyFunction);
    return () => {
      listeners.delete(notifyFunction)
    };
  }

  init();
  return { push, get, update, clear, subscribe };
}

const cart = initCart();

export default cart;

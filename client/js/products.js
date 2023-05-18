import { PRODUCTS_API } from "./api.const.js";

async function fetchProducts({ page, category, search }) {
  if (typeof page !== "number") return;
  const response = await fetch(
    search
      ? `${PRODUCTS_API}/search?keyword=${search}`
      : `${PRODUCTS_API}/${category}?paging=${page}`
  );
  const result = await response.json();
  return result;
}

function renderProduct(data) {
  const { title, price, images, colors, id } = data;

  const product = document.createElement("a");
  const productImage = document.createElement("div");
  const productColors = document.createElement("div");
  const colorElements = colors.map(() => document.createElement("div"));
  const productTitle = document.createElement("div");
  const productPrice = document.createElement("div");

  product.setAttribute("href", `product.html?id=${id}`);
  product.classList.add("product");
  productImage.classList.add("product__img");
  productColors.classList.add("product__colors");
  productTitle.classList.add("product__title");
  productPrice.classList.add("product__price");
  colorElements.forEach((element) => {
    element.classList.add("product__color");
  });

  productImage.style.backgroundImage = `url(${images[0]})`;
  productTitle.innerText = title;
  productPrice.innerText = `TWD. ${price}`;
  colors.forEach((color, index) => {
    colorElements[index].style.backgroundColor = `#${color.code}`;
  });

  colorElements.forEach((element) => {
    productColors.appendChild(element);
  });

  product.appendChild(productImage);
  product.appendChild(productColors);
  product.appendChild(productTitle);
  product.appendChild(productPrice);

  return product;
}

let productsLoading = false;
let page = 0;
async function loadProducts() {
  try {
    productsLoading = true;
    const url = new URL(location);
    const category = url.searchParams.get("category") ?? "all";
    const search = url.searchParams.get("q");
    const productsData = await fetchProducts({ page, category, search });
    const wrapper = document.querySelector(".products__wrapper");
    if (!productsData) return;
    if (search && page === 0 && productsData.data.length === 0) {
      wrapper.innerHTML = `
        <div style="width:100%; display:flex; justify-content: center;">
          <h2>查無此商品</h2>
        </div>
      `;
      return;
    }
    page = productsData.next_paging;
    const productElements = productsData.data.map(renderProduct);
    productElements.forEach((element) => {
      wrapper.appendChild(element);
    });
  } catch (err) {
    console.error(err);
  } finally {
    productsLoading = false;
  }
}

const intersectionCallback = (entries) => {
  if (entries[0].intersectionRatio <= 0 || productsLoading) return;
  loadProducts();
};

loadProducts().then(() => {
  const intersectionObserver = new IntersectionObserver(intersectionCallback);
  intersectionObserver.observe(document.getElementById("viewpoint"));
});

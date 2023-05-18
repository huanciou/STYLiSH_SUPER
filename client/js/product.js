import { PRODUCT_API } from "./js/api.const.js";
import cart from "./js/cart.js";

const { useState, useEffect } = React;

async function fetchProduct(productId) {
  const response = await fetch(`${PRODUCT_API}?id=${productId}`);
  const result = await response.json();
  return result.data;
}

function Operator({ onClick, disabled, children }) {
  return (
    <div
      onClick={disabled ? () => {} : onClick}
      className={`quantity__text quantity__operator ${
        disabled ? "operator--disabled" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Color({ selected, color, onClick }) {
  return (
    <div
      className={`product__color ${selected ? "color--selected" : ""}`}
      style={{ backgroundColor: `#${color}` }}
      onClick={onClick}
    ></div>
  );
}

function Size({ selected, disabled, onClick, children }) {
  return (
    <div
      className={`product__size ${selected ? "size--selected" : ""} ${
        disabled ? "size--disabled" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Button({ disabled, onClick, children }) {
  return (
    <div
      className={`purchase__button ${disabled ? "button--disabled" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function getStock(variants, color, size) {
  return (
    variants?.find?.((variant) => {
      return variant.color_code === color && variant.size === size;
    })?.stock ?? 0
  );
}

function Product() {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const stock = getStock(product.variants, selectedColor, selectedSize);
  useEffect(() => {
    const url = new URL(location);
    const productId = url.searchParams.get("id");
    fetchProduct(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="detail__wrapper">
      <div className="product__content">
        <div
          className="product__image"
          style={{ backgroundImage: `url(${product.main_image})` }}
        ></div>
        <div className="product__information">
          <div className="product__title">
            {loading ? "Loading..." : product.title}
          </div>
          <div className="product__number">{product.id ?? ""}</div>
          <div className="product__price">{product.price ?? ""}</div>
          <div className="product__item">
            <div className="product__subtitle">顏色</div>
            <div className="product__colors">
              {product.colors?.map?.((color) => {
                const stockOfTargetColor = getStock(
                  product.variants,
                  color.code,
                  selectedSize
                );
                return (
                  <Color
                    key={color.code}
                    color={color.code}
                    selected={selectedColor === color.code}
                    onClick={() => {
                      setSelectedColor(color.code);
                      if (stockOfTargetColor === 0) {
                        setSelectedSize();
                        setQuantity(1);
                        return;
                      }
                      setQuantity(Math.min(stockOfTargetColor, quantity));
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="product__item item__sizes">
            <div className="product__subtitle subtitle__sizes">尺寸</div>
            <div className="product__sizes">
              {product.sizes?.map?.((size) => {
                const stockOfTargetSize = getStock(
                  product.variants,
                  selectedColor,
                  size
                );
                return (
                  <Size
                    key={size}
                    selected={selectedSize === size}
                    disabled={stockOfTargetSize === 0 || !selectedColor}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(Math.min(stockOfTargetSize, quantity));
                    }}
                  >
                    {size}
                  </Size>
                );
              })}
            </div>
          </div>
          <div className="product__item item__quantity">
            <div className="product__subtitle subtitle__quantity">數量</div>
            <div className="product__quantity">
              <Operator
                disabled={!selectedSize || !selectedColor || quantity <= 1}
                onClick={() => {
                  setQuantity(Math.max(quantity - 1, 0));
                }}
              >
                -
              </Operator>
              <div id="stock" className="quantity__text quantity__text--main">
                {quantity}
              </div>
              <Operator
                disabled={!selectedSize || !selectedColor}
                onClick={() => {
                  setQuantity(Math.min(quantity + 1, stock));
                }}
              >
                +
              </Operator>
            </div>
          </div>
          <Button
            disabled={!selectedColor || !selectedSize || quantity < 1}
            onClick={() => {
              const data = {
                id: product.id,
                title: product.title,
                image: product.main_image,
                price: product.price,
                stock: product.variants.find(
                  (v) =>
                    v.color_code === selectedColor && v.size === selectedSize
                ).stock,
                color: product.colors.find((c) => c.code === selectedColor),
                size: selectedSize,
                qty: quantity,
              };
              cart.push(data);
              alert("已加入購物車");
            }}
          >
            {!selectedSize ? "請選擇尺寸" : "加入購物車"}
          </Button>
          <div className="product__notes">
            <p className="product__note">{loading ? "" : `*${product.note}`}</p>
            <p className="product__note">
              {product.texture}
              <br />
              {product.description}
            </p>
            {!loading && (
              <p className="product__note">
                {`素材產地 / ${product.place}`}
                <br />
                {`加工產地 / ${product.place}`}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="product__description">
        <div className="description__header">
          <div className="description__title">細部說明</div>
          <div className="description__divider"></div>
        </div>
        <div className="description__content">
          <div className="description__story">{product.story ?? ""}</div>
          {product.images?.map?.((image) => (
            <img key={image} className="description__image" src={image} />
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.querySelector("main"));
root.render(<Product />);

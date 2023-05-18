import cart from "./js/cart.js";

const { useSyncExternalStore } = React;

function ActionItems() {
  const productCount = useSyncExternalStore(
    cart.subscribe,
    () => cart.get().length ?? 0
  );
  return (
    <div className="actions">
      <a href="cart.html" className="action__item">
        <div style={{ position: "relative" }}>
          <img
            className="actions__cart"
            src="./images/cart-mobile.png"
            alt="cart"
          />
          <div
            className={`cart__count ${
              productCount === 0 ? "cart--invisible" : ""
            }`}
          >
            {productCount}
          </div>
        </div>
        <p className="action__text">購物車</p>
      </a>
      <div className="actions__block"></div>
      <a href="profile.html" className="action__item">
        <img
          className="actions__member"
          src="./images/member-mobile.png"
          alt="member"
        />
        <p className="action__text">會員</p>
      </a>
    </div>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#actionItems"));
root.render(<ActionItems />);

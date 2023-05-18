import cart from "./js/cart.js";

const { useState, useSyncExternalStore } = React;

const url = new URL(location);
const category = url.searchParams.get("category") ?? "all";

function Header() {
  const productCount = useSyncExternalStore(
    cart.subscribe,
    () => cart.get().length ?? 0
  );
  const [keyword, setKeyword] = useState(() => {
    url.searchParams.get("q") || "";
  });
  const [isMobileInputVisible, setIsMobileInputVisible] = useState(false);
  const handleChange = (event) => {
    setKeyword(event.target.value);
  };
  const redirectToSearchPage = () => {
    if (keyword) {
      url.searchParams.set("q", keyword);
    } else {
      url.searchParams.delete("q")
    }
    location.href = url.href;
  };
  const handlePressEnter = (event) => {
    if (event.isComposing || event.keyCode === 229 || event.code !== "Enter") {
      return;
    }
    redirectToSearchPage();
  };
  const handleMobileSearchClick = () => {
    if (isMobileInputVisible && keyword) {
      redirectToSearchPage();
    } else {
      setIsMobileInputVisible((value) => !value);
    }
  };
  const handleDesktopSearchClick = () => {
    redirectToSearchPage();
  };
  return (
    <>
      <header>
        <a
          className={`logo ${isMobileInputVisible ? "logo--hidden" : ""}`}
          href="./index.html"
        >
          <img className="logo__img" src="/images/logo.png" alt="logo" />
        </a>
        <input
          type="text"
          className={`search__input--mobile ${
            isMobileInputVisible ? "input__mobile--focus" : ""
          }`}
          value={keyword}
          focus={String(isMobileInputVisible)}
          onChange={handleChange}
          onKeyPress={handlePressEnter}
          onBlur={() => {
            setIsMobileInputVisible(false);
          }}
        />
        <div className="header__search">
          <img
            id="mobileSearchIcon"
            className="search__icon"
            src="/images/search.png"
            alt="search"
            onClick={handleMobileSearchClick}
          />
        </div>
        <div className="header__menu">
          <a
            href="index.html?category=women"
            className={`menu__item women ${
              category === "women" ? "item--active" : ""
            }`}
          >
            女裝
          </a>
          <div className="menu__block"></div>
          <a
            href="index.html?category=men"
            className={`menu__item men ${
              category === "men" ? "item--active" : ""
            }`}
          >
            男裝
          </a>
          <div className="menu__block"></div>
          <a
            href="index.html?category=accessories"
            className={`menu__item accessories ${
              category === "accessories" ? "item--active" : ""
            }`}
          >
            配件
          </a>
        </div>
        <div className="header__actions">
          <div className="action__search">
            <input
              id="search"
              className="search__input"
              type="text"
              value={keyword}
              onChange={handleChange}
              onKeyPress={handlePressEnter}
            />
            <img
              className="search__icon"
              src="/images/search.png"
              alt="search"
              onClick={handleDesktopSearchClick}
            />
          </div>
          <a href="cart.html" className="action__item">
            <img className="actions__cart" src="/images/cart.png" alt="cart" />
            <div className={`cart__count ${productCount === 0 ? "cart--invisible" : ""}`}>{productCount}</div>
          </a>
          <a href="profile.html" className="action__item">
            <img
              className="actions__member"
              src="/images/member.png"
              alt="member"
            />
          </a>
        </div>
      </header>
      <div className="menu">
        <a
          href="index.html?category=women"
          className={`menu__item women ${
            category === "women" ? "item--active" : ""
          }`}
        >
          女裝
        </a>
        <div className="menu__block"></div>
        <a
          href="index.html?category=men"
          className={`menu__item men ${
            category === "men" ? "item--active" : ""
          }`}
        >
          男裝
        </a>
        <div className="menu__block"></div>
        <a
          href="index.html?category=accessories"
          className={`menu__item accessories ${
            category === "accessories" ? "item--active" : ""
          }`}
        >
          配件
        </a>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#header"));
root.render(<Header />);

import cart from "./js/cart.js";
import useLogin from "./js/useLogin.js";
import useTapPay from "./js/useTapPay.js";
import { CHECKOUT } from "./js/api.const.js";

const FREIGHT = 30;

function CartHeader({ itemsCount }) {
  return (
    <div className="cart__header">
      <div className="cart__header-number">購物車({itemsCount})</div>
      <div className="cart__header-quantity">數量</div>
      <div className="cart__header-price">單價</div>
      <div className="cart__header-subtotal">小計</div>
      <div className="cart__header-delete-button" />
    </div>
  );
}

function Shipment() {
  return (
    <div className="shipment">
      <div className="shipment__item-name">配送國家</div>
      <select className="shipment__item-selector" defaultValue="taiwan">
        <option value="taiwan">臺灣及離島</option>
      </select>
      <div className="shipment__item-name">付款方式</div>
      <select className="shipment__item-selector" defaultValue="credit_card">
        <option value="credit_card">信用卡付款</option>
      </select>
    </div>
  );
}

function Note() {
  return (
    <div className="note">
      ※ 提醒您：
      <br />● 選擇宅配-請填寫正確收件人資訊，避免包裹配送不達
      <br />● 選擇超商-請填寫正確收件人姓名(與證件相符)，避免無法領取
    </div>
  );
}

function CartItem({ item, onQuantitySelectChange, onClickDelete }) {
  return (
    <div className="cart__item">
      <img src={item.image} className="cart__item-image" />
      <div className="cart__item-detail">
        <div className="cart__item-name">{item.title}</div>
        <div className="cart__item-id">{item.id}</div>
        <div className="cart__item-color">顏色｜{item.color.name}</div>
        <div className="cart__item-size">尺寸｜{item.size}</div>
      </div>
      <div className="cart__item-quantity">
        <div className="cart__item-quantity-title">數量</div>
        <select
          value={item.qty}
          className="cart__item-quantity-selector"
          onChange={onQuantitySelectChange}
        >
          {Array(item.stock)
            .fill()
            .map((_, index) => (
              <option key={index}>{index + 1}</option>
            ))}
        </select>
      </div>
      <div className="cart__item-price">
        <div className="cart__item-price-title">單價</div>
        <div className="cart__item-price-content">NT.{item.price}</div>
      </div>
      <div className="cart__item-subtotal">
        <div className="cart__item-subtotal-title">小計</div>
        <div className="cart__item-subtotal-content">
          NT.{item.qty * item.price}
        </div>
      </div>
      <div className="cart__delete-button" onClick={onClickDelete} />
    </div>
  );
}

function validateItems(cartItems) {
  if (cartItems.length === 0) {
    throw new Error("尚未選購商品");
  }
}

function CartPage() {
  const [cartItems, _setCartItems] = React.useState(cart.get());
  const setCartItems = (newItems) => {
    _setCartItems(newItems);
    cart.update(newItems);
  };
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [time, setTime] = React.useState();
  const [emptyInfos, setEmptyInfos] = React.useState([]);
  const formRef = React.useRef();
  const { token, login } = useLogin();
  useTapPay();

  function changeQuantity(itemIndex, itemQuantity) {
    const newCartItems = cartItems.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            qty: itemQuantity,
          }
        : item
    );
    setCartItems(newCartItems);
    window.alert("已修改數量");
  }

  function deleteItem(itemIndex) {
    const newCartItems = cartItems.filter((_, index) => index !== itemIndex);
    setCartItems(newCartItems);
    window.alert("已刪除商品");
  }

  const subtotal = cartItems.reduce(
    (prev, item) => prev + item.price * item.qty,
    0
  );

  function validateRecipient(recipient) {
    const emptyFields = Object.keys(recipient).filter((key) => !recipient[key]);
    if (emptyFields.length > 0) {
      setEmptyInfos(emptyFields);
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      throw new Error("請填寫完整訂購資料");
    } else {
      setEmptyInfos([]);
    }
  }

  async function checkout() {
    try {
      validateItems(cartItems);
      const recipient = {
        name,
        phone,
        email,
        address,
        time,
      };
      validateRecipient(recipient);
      const userToken = token || (await login());
      if (!TPDirect.card.getTappayFieldsStatus().canGetPrime) {
        window.alert("付款資料輸入有誤");
        return;
      }

      TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
          window.alert("付款資料輸入有誤");
          return;
        }

        fetch(CHECKOUT, {
          body: JSON.stringify({
            prime: result.card.prime,
            order: {
              shipping: "delivery",
              payment: "credit_card",
              subtotal,
              freight: FREIGHT,
              total: subtotal + FREIGHT,
              recipient,
              list: cartItems,
            },
          }),
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          }),
          method: "POST",
        })
          .then((response) => response.json())
          .then((json) => {
            window.alert("付款成功");
            cart.clear();
            location.href = `./thankyou.html?number=${json.data.number}`;
          });
      });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="cart">
      <CartHeader itemsCount={cartItems.length} />
      <div className="cart__items">
        {cartItems.map((item, index) => (
          <CartItem
            key={`${item.id}-${item.size}-${item.color.code}`}
            item={item}
            onQuantitySelectChange={(e) =>
              changeQuantity(index, e.target.value)
            }
            onClickDelete={() => deleteItem(index)}
          />
        ))}
      </div>
      <Shipment />
      <Note />
      <div className="form" ref={formRef}>
        <div className="form__title">訂購資料</div>
        <div className="form__field">
          <div className="form__field-name">收件人姓名</div>
          <input
            className="form__field-input"
            style={
              emptyInfos.includes("name") ? { borderColor: "deeppink" } : {}
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form__note">
          務必填寫完整收件人姓名，避免包裹無法順利簽收
        </div>
        <div className="form__field">
          <div className="form__field-name">Email</div>
          <input
            className="form__field-input"
            style={
              emptyInfos.includes("email") ? { borderColor: "deeppink" } : {}
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">手機</div>
          <input
            className="form__field-input"
            style={
              emptyInfos.includes("phone") ? { borderColor: "deeppink" } : {}
            }
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">地址</div>
          <input
            className="form__field-input"
            style={
              emptyInfos.includes("address") ? { borderColor: "deeppink" } : {}
            }
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="form__field">
          <div className="form__field-name">配送時間</div>
          <div className="form__field-radios">
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === "morning"}
                onChange={(e) => {
                  if (e.target.checked) setTime("morning");
                }}
              />{" "}
              08:00-12:00
            </label>
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === "afternoon"}
                onChange={(e) => {
                  if (e.target.checked) setTime("afternoon");
                }}
              />{" "}
              14:00-18:00
            </label>
            <label className="form__field-radio">
              <input
                type="radio"
                checked={time === "anytime"}
                onChange={(e) => {
                  if (e.target.checked) setTime("anytime");
                }}
              />{" "}
              不指定
            </label>
          </div>
        </div>
      </div>
      <div className="form">
        <div className="form__title">付款資料</div>
        <div className="form__field">
          <div className="form__field-name">信用卡號碼</div>
          <div className="form__field-input" id="card-number" />
        </div>
        <div className="form__field">
          <div className="form__field-name">有效期限</div>
          <div className="form__field-input" id="card-expiration-date" />
        </div>
        <div className="form__field">
          <div className="form__field-name">安全碼</div>
          <div className="form__field-input" id="card-ccv" />
        </div>
      </div>
      <div className="total">
        <div className="total__name">總金額</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{subtotal}</div>
      </div>
      <div className="freight">
        <div className="freight__name">運費</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{FREIGHT}</div>
      </div>
      <div className="payable">
        <div className="payable__name">應付金額</div>
        <div className="total__nt">NT.</div>
        <div className="total__amount">{subtotal + FREIGHT}</div>
      </div>
      <button className="checkout-button" onClick={checkout}>
        確認付款
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.querySelector("main"));
root.render(<CartPage />);

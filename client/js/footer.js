class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer__wrapper">
          <div class="footer__menu">
            <div class="footer__item">關於 Stylish</div>
            <div class="footer__item">服務條款</div>
            <div class="footer__item">隱私政策</div>
            <div class="footer__item">聯絡我們</div>
            <div class="footer__faq">FAQ</div>
          </div>
          <div class="footer__icons">
            <img class="footer__icon" src="./images/line.png" alt="line">
            <img class="footer__icon" src="./images/twitter.png" alt="twitter">
            <img class="footer__icon" src="./images/facebook.png" alt="facebook">
          </div>
          <div class="footer__note">
            © 2018. All rights reserved.
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('footer-component', Footer);

// pages/UrlPage.js
/**
 * Page Object para validación de URLs de la aplicación.
 */
export default class UrlPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.urls = {
      // Relativas: Playwright las resuelve contra `baseURL` (playwright.config.js)
      cart: '/cart.html',
      checkout: '/checkout-step-one.html',
      checkoutOverview: '/checkout-step-two.html',
      home: '/inventory.html',
      login: '/',
      checkoutComplete: '/checkout-complete.html'
    };
  }

  /**
   * Valida que la URL actual sea la esperada
   * @param {string} expectedUrl
   */
  async validateUrl(expectedUrl) {
    await this.page.waitForURL(expectedUrl);
  }

  /** Valida la URL de login */
  async validateLoginUrl() {
    await this.validateUrl(this.urls.login);
  }

  /** Valida la URL de home */
  async validateHomeUrl() {
    await this.validateUrl(this.urls.home);
  }

  /** Valida la URL del carrito */
  async validateCartUrl() {
    await this.validateUrl(this.urls.cart);
  }

  /** Valida la URL del checkout */
  async validateCheckoutUrl() {
    await this.validateUrl(this.urls.checkout);
  }
  /** Valida la URL del resumen de checkout */
  async validateCheckoutOverviewUrl() {
    await this.validateUrl(this.urls.checkoutOverview);
  }
}

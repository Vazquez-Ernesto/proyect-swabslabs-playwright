/**
 * Page Object para la página del carrito.
 */
export default class CartPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.cartItemCount = page.locator('.shopping_cart_badge');
    this.checkoutButton = page.locator('.checkout_button'); // Ajustado selector
    this.validateUrlCart = '/cart.html';
    this.valideteUrlCheckout = '/checkout-step-one.html';
    this.validateUrlHome = '/inventory.html';
  }

  /**
   * Navega al carrito
   */
  async goToCart() {
    await this.page.click('.shopping_cart_link');
  }

  /**
   * Valida la cantidad de ítems en el carrito
   * @param {number} count
   */
  async validateItemCount(count) {
    if (count > 0) {
      await this.cartItemCount.waitFor({ state: 'visible' });
      const text = await this.cartItemCount.textContent();
      if (parseInt(text) !== count) {
        throw new Error(`Se esperaba ${count} en el carrito, pero apareció ${text}`);
      }
    } else {
      await this.cartItemCount.waitFor({ state: 'detached' });
    }
  }

  /**
   * Procede al checkout
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /**
   * Valida la URL del carrito
   */
  async validateCartUrl() {
    await this.page.waitForURL(this.validateUrlCart);
  }

  /**
   * Valida la URL del checkout
   */
  async validateCheckoutUrl() {
    await this.page.waitForURL(this.valideteUrlCheckout);
  }

  /**
   * Valida la URL del home
   */
  async validateHomeUrl() {
    await this.page.waitForURL(this.validateUrlHome);
  }

  /**
   * Valida que el botón de checkout sea visible
   */
  async validateCheckoutButtonVisible() {
    await this.checkoutButton.waitFor({ state: 'visible' });
  }

  /**
   * Valida que haya al menos un producto en el carrito
   */
  async validateHasProducts() {
    const items = await this.page.locator('.cart_item').count();
    if (items === 0) {
      throw new Error('No hay productos en el carrito');
    }
  }

  /**
   * Hace clic en el botón 'Continue Shopping' para volver al home
   */
  async continueShopping() {
    await this.page.locator('.btn_secondary').click();
  }
}

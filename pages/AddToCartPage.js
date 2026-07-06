/**
 * Page Object para la página de agregar al carrito.
 */
export default class AddToCartPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.firstAddToCartButton = page.getByRole('button', { name: 'ADD TO CART' });
    this.firstRemoveButton = page.getByRole('button', { name: 'REMOVE' });
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  /**
   * Agrega el primer producto al carrito
   */
  async addFirstProductToCart() {
    await this.firstAddToCartButton.first().click();
  }

  /**
   * Quita el primer producto del carrito
   */
  async removeFirstProductFromCart() {
    await this.firstRemoveButton.first().click();
  }

  /**
   * Valida que el botón REMOVE sea visible
   */
  async validateRemoveButtonVisible() {
    await this.firstRemoveButton.first().waitFor({ state: 'visible' });
  }

  /**
   * Valida que el botón ADD TO CART sea visible
   */
  async validateAddButtonVisible() {
    await this.firstAddToCartButton.first().waitFor({ state: 'visible' });
  }

  /**
   * Valida la cantidad de productos en el carrito
   * @param {number} expectedCount
   */
  async validateCartCount(expectedCount) {
    if (expectedCount > 0) {
      await this.cartBadge.waitFor({ state: 'visible' });
      const countText = await this.cartBadge.textContent();
      if (parseInt(countText) !== expectedCount) {
        throw new Error(`Se esperaba ${expectedCount} en el carrito, pero apareció ${countText}`);
      }
    } else {
      await this.cartBadge.waitFor({ state: 'detached' });
    }
  }
}

/**
 * Page Object para la página de detalle de producto.
 */
export default class ProductDetailPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.productName = page.locator('.inventory_details_name');
    this.productDesc = page.locator('.inventory_details_desc');
    this.productPrice = page.locator('.inventory_details_price');
    this.addToCartButton = page.locator('button:has-text("Add to cart")');
    this.removeButton = page.locator('button:has-text("Remove")');
    this.backButton = page.locator('.inventory_details_back_button');
  }

  /**
   * Obtiene el nombre del producto
   * @returns {Promise<string>}
   */
  async getName() {
    return await this.productName.textContent();
  }

  /**
   * Obtiene la descripción del producto
   * @returns {Promise<string>}
   */
  async getDescription() {
    return await this.productDesc.textContent();
  }

  /**
   * Obtiene el precio del producto
   * @returns {Promise<string>}
   */
  async getPrice() {
    return await this.productPrice.textContent();
  }

  /**
   * Agrega el producto al carrito
   */
  async addToCart() {
    await this.addToCartButton.click();
  }

  /**
   * Quita el producto del carrito
   */
  async removeFromCart() {
    await this.removeButton.click();
  }

  /**
   * Vuelve al inventario
   */
  async backToProducts() {
    await this.backButton.click();
  }
}

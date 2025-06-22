/**
 * Page Object para la página de inventario (productos).
 */
export default class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.productItems = page.locator('.inventory_item');
    this.productNames = page.locator('.inventory_item_name');
    this.filterSelect = page.locator('.product_sort_container');
  }

  /**
   * Devuelve la cantidad de productos listados
   * @returns {Promise<number>}
   */
  async getProductCount() {
    return await this.productItems.count();
  }

  /**
   * Selecciona un filtro de ordenamiento por valor
   * @param {string} value
   */
  async selectFilter(value) {
    await this.filterSelect.selectOption(value);
  }

  /**
   * Hace clic en el nombre de un producto por índice (0-based)
   * @param {number} index
   */
  async goToProductDetail(index) {
    await this.productNames.nth(index).click();
  }

  /**
   * Obtiene el nombre de un producto por índice
   * @param {number} index
   * @returns {Promise<string>}
   */
  async getProductName(index) {
    return await this.productNames.nth(index).textContent();
  }
}

/**
 * Page Object para el header/navbar de la aplicación.
 */
export default class HeaderPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.cartIcon = page.locator('.shopping_cart_link');
    this.menuButton = page.locator('.bm-burger-button');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
  }

  /**
   * Hace clic en el ícono del carrito
   */
  async goToCart() {
    await this.cartIcon.click();
  }

  /**
   * Abre el menú lateral
   */
  async openMenu() {
    await this.menuButton.click();
  }

  /**
   * Hace logout desde el menú
   */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /**
   * Navega al inventario desde el menú
   */
  async goToInventory() {
    await this.openMenu();
    await this.allItemsLink.click();
  }
}

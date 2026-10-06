/**
 * Page Object para la página de checkout.
 */
export default class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishCheckoutButton = page.locator('.btn_action.cart_button');
    this.cancelButton = page.locator('.cart_cancel_link.btn_secondary');
  }

  /**
   * Llena el formulario de checkout
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} postalCode
   */
  async fillCheckoutInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Continúa al resumen de compra
   */
  async proceedToOverview() {
    await this.continueButton.click();
  }

  /**
   * Finaliza el checkout
   */
  async finishCheckout() {
    await this.finishCheckoutButton.click();
  }

  /**
   * Cancela el checkout
   */
  async cancelCheckout() {
    await this.cancelButton.click();
  }

  /**
   * Valida que la URL sea la de checkout completo
   */
  async validateCheckoutComplete() {
    await this.page.waitForURL(/.*checkout-complete/);
  }
}
// pages/CheckoutPage.js
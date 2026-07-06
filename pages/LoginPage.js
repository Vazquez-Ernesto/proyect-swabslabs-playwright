/**
 * Page Object para la página de login.
 */
export default class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page - Instancia de Playwright Page
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('#login-button');
  }

  /**
   * Navega a la página de login
   */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/v1/');
  }

  /**
   * Realiza login con usuario y contraseña
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

}


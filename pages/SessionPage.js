/**
 * Page Object para acciones relacionadas a la sesión del usuario.
 */
export default class SessionPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.loginUrl = 'https://www.saucedemo.com/';
  }

  /**
   * Intenta acceder a una URL protegida sin login
   * @param {string} url
   */
  async goToProtectedUrl(url) {
    await this.page.goto(url);
    // Esperamos un momento para que la redirección ocurra
    await this.page.waitForTimeout(1000);
  }

  /**
   * Valida que se redirige al login
   * @returns {Promise<boolean>}
   */
  async validateRedirectToLogin() {
    try {
      // Verificar que estamos en la URL correcta
      const currentUrl = this.page.url();
      const isLoginUrl = currentUrl === this.loginUrl;
      
      if (!isLoginUrl) {
        console.log(`URL esperada: ${this.loginUrl}, URL actual: ${currentUrl}`);
        return false;
      }

      // Verificar que los elementos del login están presentes
      const usernameInput = await this.page.waitForSelector('#user-name', {
        state: 'visible',
        timeout: 5000
      });

      const passwordInput = await this.page.waitForSelector('#password', {
        state: 'visible',
        timeout: 5000
      });

      const loginButton = await this.page.waitForSelector('#login-button', {
        state: 'visible',
        timeout: 5000
      });

      return !!(usernameInput && passwordInput && loginButton);
    } catch (error) {
      console.log(`Error validando login: ${error.message}`);
      return false;
    }
  }
}

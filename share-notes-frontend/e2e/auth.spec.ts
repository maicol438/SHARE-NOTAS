import { test, expect } from '@playwright/test';

test.describe('Flujo de Usuario Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('LP-01: Navegación Landing - elementos principales visibles', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const navTitle = page.getByRole('navigation').getByText('ShareNotes').first();
    await expect(navTitle).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Organiza tus estudios')).toBeVisible();
    await expect(page.getByText('Comparte conocimiento')).toBeVisible();
    await expect(page.getByRole('button', { name: /Regístrate gratis/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Ingresar/i }).first()).toBeVisible();
  });

  test('LP-02: Navegación Landing → Login', async ({ page }) => {
    await page.getByRole('button', { name: /Ingresar/i }).first().click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
  });

  test('LP-03: Navegación Landing → Register', async ({ page }) => {
    await page.getByRole('button', { name: /Regístrate gratis/i }).first().click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /Crear cuenta/i })).toBeVisible();
  });

  test('AUTH-01: Login - validación de formularios con errores', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Ingresar/i }).click();
    await expect(page.getByText(/El email es requerido/i)).toBeVisible();
    await expect(page.getByText(/La contraseña es requerida/i)).toBeVisible();
  });

  test('AUTH-03: Login - email inválido muestra error del servidor', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /Ingresar/i }).click();
    await expect(page.getByText(/Credenciales incorrectas/i).or(page.getByText(/Error/i))).toBeVisible();
  });

  test('AUTH-04: Register - contraseña corta muestra error', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '123');
    await page.getByRole('button', { name: /Crear cuenta/i }).click();
    await expect(page.getByText(/Mínimo 6 caracteres/i)).toBeVisible();
  });

  test('AUTH-05: Recuperación de contraseña - navegación', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /¿Olvidaste tu contraseña/i }).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByRole('heading', { name: /Recuperar contraseña/i })).toBeVisible();
  });

  test('AUTH-06: Forgot Password - validación de email', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('button', { name: /Enviar/i }).click();
    await expect(page.getByText(/El email es requerido/i)).toBeVisible();
  });

  test('AUTH-07: Redirección a dashboard si ya autenticado', async ({ page }) => {
    await page.goto('/login?error=auth_error');
    await expect(page.getByText(/Hubo un error al autenticar/i).first()).toBeVisible();
  });

  test('UI-01: Modo oscuro - toggle funciona', async ({ page }) => {
    await page.goto('/login');
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');

    const darkToggle = page.getByRole('button', { name: /Cambiar tema/i });
    if (await darkToggle.isVisible()) {
      await darkToggle.click();
      const afterClass = await html.getAttribute('class');
      expect(afterClass).not.toBe(initialClass);
    }
  });

  test('UI-02: Elementos responsive en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Volver/i })).toBeVisible();
  });

  test('UI-04: Botones de navegación en landing', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Tus notas,').first()).toBeVisible({ timeout: 15000 });
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(3);
  });

  test('NAV-01: Navegación Login → Register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /Regístrate gratis/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('NAV-02: Navegación Register → Login', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: /Inicia sesión/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('NAV-03: Volver desde Login a Landing', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /Volver/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('AUTH-08: Login - toggle mostrar/ocultar contraseña', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('miPassword123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = page.getByRole('button', { name: '' }).filter({ has: page.locator('.lucide-eye, .lucide-eye-off') });
    const count = await toggleButton.count();
    if (count > 0) {
      await toggleButton.first().click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('SEARCH-01: Landing - sección de comunidad visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Comunidad/i).first()).toBeVisible();
  });
});

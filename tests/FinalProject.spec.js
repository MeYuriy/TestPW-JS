import { test, expect } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({ 
  use: {
    // Эмулирует локаль пользователя. По дефолту тестовая Еда открывается на английской локали
    locale: 'ru-RU',
    permissions: [],
  },
  expect: {
    // Максимальное время, которое expect() должен ждать, чтобы условие было выполнено. Тестовая Еда иногда загружается дольше дефолтных 5 секунд, из-за чего тесты падают
    timeout: 15000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Важно определить свойство `viewport` после деструктуризации `devices`,
        // так как устройства также определяют `viewport` для этого устройства.
        viewport: { width: 1280, height: 720 },
      },
    },
  ]
});

test.describe('Итоговый проект', () => {
  test.beforeEach(async ({ page }) => {
    //await page.goto('https://playwright.dev/'); - можно указать условие, которое выполняется перез запуском тестов, к примеру, октрыть страницу по урлу
  });
  test.use({ viewport: { width: 1820, height: 1000 } });
  test.use({
    locale: 'ru-RU',
  });
  test.use({permissions: []}) // блокировка уведомлений/запросов от браузера, к примеру, доступ к гео

  test('[Desktop] Сброс фильтров при клике на лого в шапке - 53200', async ({ page }) => { // по мотивам тк https://tms.yandex-team.ru/projects/yandex_eats/testcases/53200
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
    
    const Pickup = page.locator('[aria-label="Самовывоз"]');

    await expect(Pickup).toHaveAttribute('aria-selected', 'false');
    await Pickup.click();
    await expect(Pickup).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('link', { name: 'Логотип Яндекс Еды' }).click();
    await expect.soft(Pickup, 'тест кастомного сообщения об ошибке').toHaveAttribute('aria-selected', 'false'); // мягкое утверждение "expect.soft()"
    


    page.close()
  
  });

  // практика использования моков 

  test('[Desktop] Пустой ответ каталога - 53131', async ({ page }) => { // по мотивам тк https://tms.yandex-team.ru/projects/yandex_eats/testcases/53131
    // 1. Мокируем тело ответа сервера нужной ручки файлом json с пк
    const fs = require('fs');
    await page.route('**/eats/v1/layout-constructor/v1/layout', async (route) => {
      const mockData = JSON.parse(fs.readFileSync('D:/PlayWright/mocks/EmptyLayout.json'));
      await route.fulfill({
        json: mockData,
      });
    });
  
    // 2. Переходим на главную Еды
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
    
    // 3. Убеждаемся, что мок встал путем проверки текста в пустом лейауте
    await expect(page.locator('[class="tumakef"]')).toContainText('Нас тут ещё нет :(');
  
    page.close();
  });

  // практика подгрузки куков 

  test('Проверка, что пользователь авторизован (авторизация через подгрузку куки)', async ({ page, context }) => {
  // 1. Загружаем куки
  const fs = require('fs');
  const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
  await context.addCookies(cookies);
  
  // 2. Переходим на страницу (куки уже применены)
  await page.goto('https://testing.eda.tst.yandex.ru/');

  // 3. Проверка авторизациир
  await page.locator('[aria-label="Профиль"]').click();
  await expect(page.locator('[class="njj7xdl"]')).toContainText('Юрок');

  page.pause()
  page.close()
});

});
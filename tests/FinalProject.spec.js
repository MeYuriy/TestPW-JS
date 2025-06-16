import { test, expect } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import { log } from 'console';

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
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
  });
  test.use({ viewport: { width: 1820, height: 1000 } });
  test.use({
    locale: 'ru-RU',
  });
  test.use({permissions: []}) // блокировка уведомлений/запросов от браузера, к примеру, доступ к гео

  test('[Desktop] Сброс фильтров при клике на лого в шапке - 53200', async ({ page }) => { // по мотивам тк https://tms.yandex-team.ru/projects/yandex_eats/testcases/53200
    const Pickup = page.getByText('Самовывоз');
    const header = page.getByRole('link', { name: 'Логотип Яндекс Еды' })

    await expect(Pickup).toHaveAttribute('aria-selected', 'false');
    await Pickup.click();
    await expect(Pickup).toHaveAttribute('aria-selected', 'true');

    await header.click();
    await expect(Pickup).toHaveAttribute('aria-selected', 'false');
    
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
    const text = page.getByText('Нас тут ещё нет :(');
    const btn = page.getByRole("button", {name: 'Сообщить мне'});
    // 2. Убеждаемся, что мок встал путем проверки текста в пустом лейауте
    await expect(text).toContainText('Нас тут ещё нет :('); // глупая проверка -__-
    await expect(btn).toHaveText('Сообщить мне');

    page.close();
  });

  // практика подгрузки куков 
  test('Проверка, что пользователь авторизован (авторизация через подгрузку куки)', async ({ page, context }) => {
  // 1. Загружаем куки
  const fs = require('fs');
  const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
  await context.addCookies(cookies);

  // 2. Проверка авторизациир
  const profileIcon = page.locator('[aria-label="Профиль"]');
  const profileName = page.locator('[class="njj7xdl"]');

  await profileIcon.click();
  await expect(profileName).toContainText('Юрок');

  page.close()
});

test('[Desktop] Выбор языка 55470', async ({ page, context }) => { //по мотиван тк https://tms.yandex-team.ru/projects/yandex_eats/testcases/55470
  // 1. Загружаем куки
  const fs = require('fs');
  const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
  await context.addCookies(cookies);

  const buttonLanguage = page.locator('[class="LanguageButton_name_ny358sc"]');
  const selectLanguage = page.getByText('English');

  await expect(buttonLanguage).toHaveText('Русский');

  await buttonLanguage.click();
  await selectLanguage.click();

  await expect(buttonLanguage).toHaveText('English');

  page.close()
});

test('[Desktop] отображение баллов Плюса', async ({ page, context }) => {
  // 1. Загружаем куки
  const fs = require('fs');
  const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
  await context.addCookies(cookies);

  const logoUser = page.getByTestId('avatar');
  const PlusScore = page.getByTestId('desktop-profile-popup-menu-list-item');

  await logoUser.click()

  await expect(PlusScore.nth(0)).toContainText('Ваши баллы плюса:');

  page.close()
});

// практика пекреключения фокуса на новую вкладку 
test('[Desktop] Переход по кнопке Партнерская сеть', async ({ page, context }) => {
  // 1. Загружаем куки
  const fs = require('fs');
  const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
  await context.addCookies(cookies);

  const logoUser = page.getByTestId('avatar');
  const helpNerby = page.getByText('Партнёрская сеть');

  await logoUser.click();
  
// нихера не понял, как переключил фокус на новую вкладку, но сработало -___-
  await helpNerby.click(); // нажатие на кнопку, которая откроет новую вкладку
  const newPage = await context.waitForEvent('page'); //что-то типа ожидания открытия новой вкладки

// Взаимодействуйте с новой вкладкой как обычно.
  await expect(newPage).toHaveURL(/affiliate/);

  const pages = await context.pages(); // не придумал ничего лучше, чем закрыть все вкладки через цикл for (метод context.pages возвращает количество открытых вкладок)
for (const page of pages) {
  await page.close();
}
});

});



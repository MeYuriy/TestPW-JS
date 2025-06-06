import { test, expect } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({ 
    use: {
      // Эмулирует локаль пользователя. По дефолту тестовая Еда открывается на английской локали
      locale: 'ru-RU',
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

test.describe('Проверка создания тест-сьюта', () => {
    test.beforeEach(async ({ page }) => {
      //await page.goto('https://playwright.dev/'); - можно указать условие, которое выполняется перез запуском тестов, к примеру, октрыть страницу по урлу
    });

  test('Ввод запроса в поисковую строку', async ({ page }) => {
    await page.goto('https://ya.ru/'); 
  
    await page.locator('[name="text"]').fill('тест'); // ввод текста в поле ввода
    await page.locator('[viewBox="0 0 34 34"]').click()  // нажатие на кнопку поиска
    //await page.locator('[name="text"]').press('Enter'); // нажатие клавиши enter
    await page.locator('[class="Distribution-Actions"]').click() // нажатие на кнопку отказа в просилке сделать поискови дефолтным
  
    //await expect() - придумать ОР
    
    await page.close(); //закрытие браузера
  
  });
  
  test('Поиск кнопки по роли button метод getByRole', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole'); 
  
    const primaryButton = page.getByRole('button', { name: 'Основное действие' });
    
    await expect(primaryButton).toBeVisible();
    await expect(primaryButton).toHaveClass(/primary-btn/);
    page.close();
  });
  
  test('Поиск кнопки и проверка, что она задизейплена по роли button метод getByRole', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole'); 
  
    const DisableButton = page.getByRole('button', { name: 'Неактивная кнопка' });
    
    await expect(DisableButton).toBeVisible();
    await expect(DisableButton).toBeDisabled()
    page.close();
  });
  
  test('Проверка, что в кнопке содержится искомый текст getByRole', async ({ page }) => {
    
    await page.goto('https://osstep.github.io/locator_getbyrole');
    const Div_button = page.getByRole('button', { name: 'Div как кнопка' });
    
    await expect(Div_button).toBeVisible();
    await expect(Div_button).toHaveText('Div как кнопка');
    
    page.close();
  });
  
  test('Открытие каталога тестовой еды и выбор фильтра СВ', async ({ page }) => {
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
    
    const Pickup = page.locator('[aria-label="Carry-out"]');
  
    await Pickup.click();
    await expect(Pickup).toHaveAttribute('aria-selected', 'true');
  
    page.close()
  
  });
  
  test('Поиск текстового поля по роли textbox и ввод текста getByRole', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole'); 
  
    const usernameInput = page.getByRole('textbox', {name: 'Имя пользователя'});
  
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('тестовый пользователь');
    await expect(usernameInput).toHaveValue('тестовый пользователь');
    
    page.close();
  });
  
  test('Поиск чекбокса по роли checkbox, проверка, что он не выбран, затем выбрать его', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole');
  
    const CheckBox = page.getByRole('checkbox', {name: 'Подписаться на рассылку'});
  
    await expect(CheckBox).toBeVisible();
    await expect(CheckBox).not.toBeChecked();
    await CheckBox.check();
    await expect(CheckBox).toBeChecked();
  
    page.close();
  });
  
  test('Заполнение формы', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole'); 
  
    await page.getByRole('textbox', {name: 'Имя пользователя'}).fill('Юрок');
    await page.getByRole('textbox', {name: 'Пароль'}).fill('12345');
    await page.getByLabel('Страна').selectOption('ru');
    await page.getByRole('button', {name:'Отправить'}).click();
    
    page.close();
  });
  
  test('Поиск кнопки по роли tab методом getByRole', async ({ page }) => {
    await page.goto('https://osstep.github.io/locator_getbyrole'); 
    
    const Button = page.getByRole('tab', {name: 'Настройний'});
  
    await expect(Button).toHaveAttribute('aria-selected', 'false');
    await Button.click()
    await expect(Button).toHaveAttribute('aria-selected', 'true');
  
    page.close();
  });
  
  test('Я.Еда выбор языка и поиск товара в глобальном поиске', async ({ page }) => { // тест написан через кодген 
    await page.goto('https://eda.yandex.ru/volgograd?ref=yandex-all&shippingType=delivery&utm_source=yandex-desktop-all');
    await page.getByTestId('change-language-button').click();
    await page.getByRole('option', { name: 'Русский' }).click();
  
    await page.getByTestId('change-language-button').click();
    await page.getByTestId('search-input').click();
    await page.getByTestId('search-input').fill('Пицца');
    await page.getByRole('button', { name: 'Найти' }).click();
    await page.getByRole('button', { name: 'Магазины' }).click();
  
    page.close();
  });
  
  test('Клик по кнопке и проверка ее цвета', async ({ page }) => {
    await page.goto('http://uitestingplayground.com/click');
    const button = page.locator('[id="badButton"]')
    await button.click();
    await expect(button).toHaveCSS('background-color', 'rgb(40, 167, 69)');
  
    page.close();
  });
  
  test('Клик по нескольким радиобатонам/чек-боксам и проверка цвета', async ({ page }) => {
    await page.goto('https://jqueryui.com/resources/demos/checkboxradio/default.html');
  
    const city =  page.locator('[for="radio-1"]');
    const rating = page.locator('[for="checkbox-4"]')
    const bed = page.locator('[for="checkbox-nested-3"]');
  
    await city.click();
    await expect(city).toHaveCSS('background-color', 'rgb(0, 127, 255)');
  
    await rating.click();
    await expect(rating).toHaveCSS('background-color', 'rgb(0, 127, 255)');
  
    await bed.click();
    await expect(bed).toHaveCSS('background-color', 'rgb(0, 127, 255)');
  
    page.close();
  });
  
  test('Авторизация', async ({ page }) => {
    await page.goto('http://uitestingplayground.com/sampleapp');
  
    await page.locator('[placeholder="User Name"]').fill('yurok');
    await page.locator('[placeholder="********"]').fill('pwd');
    await page.locator('[id="login"]').click();
  
    await expect(page.locator('[id="loginstatus"]')).toContainText('Welcome');
  
    page.close();
  });
  
  test('Копировать/вставить + цикл в JS', async ({ page }) => {
    await page.goto('http://uitestingplayground.com/textinput');
  
    await page.locator('[id="newButtonName"]').fill('abc');
    await page.locator('[id="newButtonName"]').dblclick();
    await page.locator('[id="newButtonName"]').press('Control+X');
  
    for (let i = 0; i < 5; i++) {
      await page.locator('[id="newButtonName"]').press('Control+V')
    }
  
    page.close();
  });
  
  test('ютуб поиск и открытие видео', async ({ page }) => {
    await page.goto('https://www.youtube.com/');
    
    await page.locator('[placeholder="Search"]').fill('lumiere');
    await page.locator('[placeholder="Search"]').press('Enter');
    
    await page.getByText('[Official Music Video]').click()
  
    page.close();
  });
  
  test('Навести курсор на элемент методом hover', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/hovers');
  
    await page.locator('[class="figure"]').nth(0).hover() // nth() используется для указание на конкретный элемент, когда по искомому локатору их несколько, счет начинается с 0
    await expect(page.locator('[class="figure"]').nth(0)).toContainText('user1') 
    
    page.close();
  });
  
  test('Чекбокс check/uncheck', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/checkboxes');
  
    await page.locator('[type="checkbox"]').nth(0).check();
    await page.locator('[type="checkbox"]').nth(1).uncheck();
  
    await expect(page.locator('[type="checkbox"]').nth(0)).toBeChecked()
    await expect(page.locator('[type="checkbox"]').nth(1)).not.toBeChecked()
    
    page.close();
  });
  
  
  // практика использования моков 
  
  test('Мок лейаута тестинга Еды', async ({ page }) => {
    // 1. Мокируем тело ответа сервера нужной ручки файлом json с пк
    const fs = require('fs');
    await page.route('**/eats/v1/layout-constructor/v1/layout', async (route) => {
      const mockData = JSON.parse(fs.readFileSync('D:/PlayWright/mocks/layout.json'));
      await route.fulfill({
        json: mockData,
      });
    });
  
    // 2. Переходим на страницу Еды
    await page.goto('https://testing.eda.tst.yandex.ru/moscow?shippingType=delivery');
    
    // 3. Убеждаемся, что мок встал путем проверки названия лейаута
    await expect(page.locator('[class="h4gvnv6 UiKitText_root UiKitText_Title1 UiKitText_Regular UiKitText_Text"]')).toContainText('Layout products_carousel_moloko');
  
    page.close();
  });
  
  // практика подгрузки куков 
  
  test('Тест с загруженными cookies', async ({ page, context }) => {
    // 1. Загружаем куки
    const fs = require('fs');
    const cookies = JSON.parse(fs.readFileSync('D:/PlayWright/Cookie/cookiesauth.json'));
    await context.addCookies(cookies);
    
    // 2. Переходим на страницу (куки уже применены)
    await page.goto('https://testing.eda.tst.yandex.ru/');
  
    // 3. Проверка авторизациир
    await page.locator('[aria-label="Профиль"]').click();
    await expect(page.locator('[class="njj7xdl"]')).toContainText('Юрок');
  
    page.close()
  
  });

  test('Поиск элемента по тексту методом getByText', async ({ page, context }) => {
    await page.goto('https://osstep.github.io/locator_getbytext');

    const span = page.getByText('Текст внутри span');
    await expect(span).toBeVisible();
  
    page.close();
  
  });

  

  // npx playwright codegen demo.playwright.dev/todomvc - запуск кодгена через терминал
  
});
import puppeteer from 'puppeteer';

async function testApp() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('body');

    // Verificar si hay errores en la consola
    page.on('console', msg => {
      console.log('Console:', msg.text());
    });

    // Verificar el contenido del body
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML;
    });
    console.log('Body content:', bodyContent);

    // Verificar si el componente Chat está presente
    const chatExists = await page.evaluate(() => {
      return document.querySelector('.Chat') !== null;
    });
    console.log('Chat component exists:', chatExists);

    // Verificar errores en el componente
    const errorMessages = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.MuiAlert-root');
      return Array.from(errorElements).map(el => el.textContent);
    });
    console.log('Error messages:', errorMessages);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testApp();

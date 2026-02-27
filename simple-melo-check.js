const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function checkMeloApp() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to Melo app...');
    await page.goto('http://dev2.aaroncollins.info:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04/desktop/simple-check-homepage.png', fullPage: true });
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Check if we can see the login page
    const loginLink = await page.$('a[href*="sign-in"]');
    if (loginLink) {
      console.log('Found login link, navigating...');
      await page.goto('http://dev2.aaroncollins.info:3000/sign-in', { waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04/desktop/simple-check-login.png', fullPage: true });
      
      // Try to login
      console.log('Attempting login...');
      await page.type('input[type="text"], input[name="username"]', 'sophietest');
      await page.type('input[type="password"], input[name="password"]', 'SophieTest2026!');
      
      await page.screenshot({ path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04/desktop/simple-check-login-filled.png', fullPage: true });
      
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForNavigation({ timeout: 10000 });
      
      console.log('After login URL:', page.url());
      await page.screenshot({ path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04/desktop/simple-check-after-login.png', fullPage: true });
      
      // Look for create server options
      const pageContent = await page.content();
      console.log('Looking for create server elements...');
      
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons`);
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await page.evaluate(el => el.textContent, button);
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), button);
        
        if (text?.includes('+') || text?.toLowerCase().includes('create') || ariaLabel?.toLowerCase().includes('create')) {
          console.log(`Potential create button ${i}: "${text}" / "${ariaLabel}"`);
        }
      }
      
      // Save page content for analysis
      await fs.writeFile('scheduler/validation/screenshots/melo-audit/MELO-P1-S04/desktop/simple-check-page-content.html', pageContent);
      
      console.log('Simple check completed successfully!');
      
    } else {
      console.log('No login link found - checking page content...');
      const pageText = await page.evaluate(() => document.body.textContent);
      console.log('Page text preview:', pageText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error during check:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkMeloApp();
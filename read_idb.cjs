const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: 'C:/Users/Deepika/AppData/Local/Google/Chrome/User Data'
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    const data = await page.evaluate(async () => {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('LogmarkModelPerformance');
        req.onsuccess = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('runs')) {
            resolve('No runs store');
            return;
          }
          const tx = db.transaction('runs', 'readonly');
          const store = tx.objectStore('runs');
          const getAll = store.getAll();
          getAll.onsuccess = () => {
            resolve(getAll.result);
          };
        };
        req.onerror = () => reject('IDB error');
      });
    });
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();

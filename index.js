import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import open from 'open';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';


const program = new Command();
const login_zid = 'https://web.zid.sa/login';
const home_zid = 'https://web.zid.sa/home';
const storeFilePath = './store.json';

let storeNameData;

async function readStoreAndOpen() {
        try {
                const data = await fs.promises.readFile(storeFilePath, 'utf8');
                storeNameData = JSON.parse(data);

                // فتح الرابط باستخدام المتصفح الافتراضي للنظام
                await open(storeNameData.storeName);
                console.log('Opened store page...');
        } catch (err) {
                console.error('Error reading the store file:', err);
        }
}
function waitForPageLoad(url) {
        return new Promise(async (resolve, reject) => {
                try {
                        const browser = await puppeteer.launch({
                                headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
                        });
                        const page = await browser.newPage();
                        // افتح الرابط وانتظر حتى تحميل الصفحة بالكامل
                        await page.goto(url, { waitUntil: 'load' });

                        console.log('Page loaded successfully');

                        console.log('Page loaded:', url);
                        await browser.close();

                        resolve();  // اكمل العملية بعد تحميل الصفحة
                } catch (error) {
                        reject('Error loading the page: ' + error.message);
                }
        });
}

program
        .name('zidbush')
        .description('A CLI tool for managing ZID datasets')
        .version('1.0.0');

program.command('login')
        .alias('l')
        .description('Login to ZID')
        .action(() => {
                console.log('Logging in...');
                inquirer
                        .prompt([
                                {
                                        type: "input",
                                        message: "Enter store URL",
                                        name: "url_store",
                                }
                        ])
                        .then((answers) => {
                                const storeName = answers.url_store;
                                console.log("Store Name: ", storeName);
                                fs.writeFileSync(storeFilePath, JSON.stringify({ storeName: storeName }));
                                open(login_zid).then(() => {
                                        console.log('Opened login page...');
                                }).catch((error) => {
                                        console.error('Failed to open the link: ', error);
                                });
                        })
                        .catch((error) => {
                                if (error.isTtyError) {
                                        console.log(error);
                                } else {
                                        console.error('An error occurred:', error);
                                }
                        });
        });

program.command('build')
        .description('Build the ZID dataset')
        .action(async () => {
                // تنفيذ أمر Node
                await exec('node --version', (error, stdout, stderr) => {
                        if (error) {
                                console.error(`Error executing build: ${error.message}`);
                                return;
                        }
                        if (stderr) {
                                console.error(`stderr: ${stderr}`);
                                return;
                        }
                        console.log(stdout);
                });

                try {
                        await waitForPageLoad('https://example.com');  // انتظر حتى يتم تحميل الموقع
                        await readStoreAndOpen();  // بعد تحميل الموقع، أكمل تنفيذ العملية
                        console.log('Building the ZID dataset...');
                } catch (error) {
                        console.error(error);  // في حالة حدوث خطأ أثناء تحميل الصفحة
                }
        });


program.parse(process.argv);

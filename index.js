import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import open from 'open';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';

const program = new Command();
const storeFilePath = './store.json';
const Home_zid = 'https://web.zid.sa/home';
const theme_market = 'https://web.zid.sa/theme-market';

let storeNameData;

// async function readStoreAndOpen() {
//         try {
//                 const data = await fs.promises.readFile(storeFilePath, 'utf8');
//                 storeNameData = JSON.parse(data);
//                 await open(storeNameData.storeName);
//                 return storeNameData.storeName;
//         } catch (err) {
//                 console.error('Error reading the store file:', err);
//         }
// }
async function connectToExistingBrowser(url) {
        let browser;
        try {
                browser = await puppeteer.launch({
                        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
                        headless: false,
                });
                const page = await browser.newPage();
                await page.goto(url);
                console.log('theme market in opened');
        } catch (error) {
                console.error('Error connecting to the browser:', error);
        }
}

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

program
        .name('zidbush')
        .description('A CLI tool for managing ZID datasets')
        .version('1.0.0');

program.command('build')
        .description('Build the ZID dataset')
        .action(async () => {
                exec('node --version', (error, stdout, stderr) => {
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
                        connectToExistingBrowser(theme_market);
                        console.log('Building the ZID dataset...');
                } catch (error) {
                        console.error('Error during the build process:', error);
                }
        });

program.parse(process.argv);

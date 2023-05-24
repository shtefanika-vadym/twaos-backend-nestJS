import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import { TemplateDelegate } from 'handlebars';

@Injectable()
export class PuppeteerService {
  async generatePDF(templateName: string, templateData: object): Promise<Buffer> {
    try {
      const template: TemplateDelegate = handlebars.compile(
        fs.readFileSync(path.resolve(path.join(process.cwd(), 'templates'), templateName), 'utf-8'),
      );

      const html: string = template(templateData);

      const browser: puppeteer.Browser = await puppeteer.launch();
      const page: puppeteer.Page = await browser.newPage();
      await page.setContent(html);

      // await page.setViewport({
      //   width: 595.28,
      //   height: 420.94 / 2,
      //   deviceScaleFactor: 1,
      // });

      const buffer: Buffer = await page.pdf({
        format: 'A4',
        margin: {
          left: '20mm',
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
        },
      });

      await browser.close();

      return buffer;
    } catch (error) {
      console.error(error);
    }
  }
}

import { Controller, Get, Logger, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as cheerio from 'cheerio';

@Controller()
export class AppController {

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file) {
    const text = file.buffer.toString();
    return this.analysisColor(text);
  }

  @Get('test')
  test() {
    return 123;
  }

  private analysisColor(html: string) {
    const $ = cheerio.load(html);
    const script = $('head script').html();
    if (script) {
      const index = script.indexOf('$(function');
      if (index >= 0) {
        const smappCall = script.slice(index).trim().replace(/\)\s*\}\);\n*.*/, '');
        const start = smappCall.indexOf('SMApp(');
        // const parse = Parser.parse(smappCall);
        if (start >= 0) {
          const json = JSON.parse(smappCall.slice(start + 6));
          const map = json.artboards.reduce((p, c) => {
            return c.layers.reduce((lp, lc) => {
              this.countColor(lc.fills, lp);
              this.countColor(lc.borders, lp);
              if (lc.color) {
                const color = this.getColor(lc);
                this.addUpColor(color, lp);
              }
              return lp;
            }, p);
          }, {});
          const sorted = Object.keys(map).reduce((p, c) => {
            return [...p, { color: c, count: map[c] }];
          }, []).sort((a, b) => b.count - a.count);
          return {valid: true, data: sorted};
        }
      }
    }
    return {valid: false};
  }

  private countColor(arr: any[], cache: any) {
    if (arr && arr.length) {
      switch (arr[0].fillType) {
        case 'gradient':
          arr[0].gradient.colorStops.reduce((cp, cc) => {
            const ckey = this.getColor(cc);
            this.addUpColor(ckey, cp);
            return cp;
          }, cache);
          break;
        case 'color':
          const key = this.getColor(arr[0]);
          this.addUpColor(key, cache);
          break;
      }
    }
  }

  private getColor(obj: any) {
    return obj.color['color-hex'].slice(0, 7);
  }

  private addUpColor(color: string, cache: any) {
    cache[color] = cache[color] ? cache[color] + 1 : 1;
  }
}

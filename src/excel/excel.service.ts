import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';

@Injectable()
export class ExcelService {
  convertExcelToJson(
    file: Express.Multer.File,
    concatenateName: boolean,
    additionalColumn?: object,
  ) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: true });

    if (additionalColumn)
      jsonData = jsonData.map((row: any) => ({
        ...row,
        ...additionalColumn,
      }));

    if (concatenateName) {
      const concatenatedData = jsonData.map((row: any) => {
        const concatenatedValue = `${row['first_name']} ${row['initials']}. ${row['last_name']}`;
        return { ...row, full_name: concatenatedValue };
      });

      return concatenatedData;
    }

    return jsonData;
  }
}

import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/users/roles/user-role';

@Injectable()
export class ExcelService {
  async convertExcelUsersToJson(
    file: Express.Multer.File,
    role: UserRole,
    facultyName: string,
    concatenateName?: boolean,
  ) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: true });

    jsonData = await Promise.all(
      jsonData.map(async (row: any) => ({
        ...row,
        role,
        faculty_name: facultyName,
        password: await bcrypt.hash(row.email.split('@')[0], 5),
      })),
    );

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

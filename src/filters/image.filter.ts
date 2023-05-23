import { BadRequestException } from '@nestjs/common';

export const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
): void => {
  if (!Boolean(file.mimetype.match(/(jpg|jpeg|png)/))) {
    callback(new BadRequestException('Only types of .jpg, .jpeg, .png are allowed'), false);
  }
  callback(null, true);
};

export const excelFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
): void => {
  if (!Boolean(file.mimetype.match(/(csv)/))) {
    callback(new BadRequestException('Only type .csv are allowed'), false);
  }
  callback(null, true);
};

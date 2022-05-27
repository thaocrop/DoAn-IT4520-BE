import path, { extname } from 'path';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0].toString().replaceAll(' ', '-');
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
export const checkFileType = (req, file, cb) => {
  const fileSize = parseInt(req.headers['content-length']);
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  // Check file size

  if (mimetype && extname) {
    if (fileSize <= 10240000) {
      return cb(null, true);
    } else {
      req.errorImage = 'Dung lượng ảnh tối đa là 10mb';
      return cb(null, false);
    }
  } else {
    req.errorImage = 'Ảnh không đúng định dạng hoặc không hỗ trợ';
    return cb(null, false);
  }
};

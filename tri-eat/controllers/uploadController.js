const multer = require('multer');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); // yah we good, proceed
    } else {
      next({message: 'That filetype isn`t allowed!'}, false);
    }
  }
};
const jimp = require('jimp');
const uuid = require('uuid');

// upload to memory
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (! req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we can resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO); // width is 800
  // save to disk
  const destination = req.body.isStore === 'true'? 'stores' : 'reviews';
  await photo.write(`./public/uploads/${destination}/${req.body.photo}`);
  next();
};

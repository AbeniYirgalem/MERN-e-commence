const multer = require("multer");
const stream = require("stream");
const { uploadStream, buildKey } = require("../services/storage");

// Use memory storage in multer then stream each file to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle product media: up to 10 images and 1 video
const productMedia = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

// Middleware to handle verification docs: multiple files
const verificationDocs = upload.array("docs", 10);

// After multer stores files in memory, stream them to S3 and attach urls to req.uploadedFiles
const pushToS3 = async (req, res, next) => {
  try {
    req.uploadedFiles = req.uploadedFiles || {};
    const allFiles = [];
    if (req.files) {
      // req.files may be an object (fields) or array
      if (Array.isArray(req.files)) {
        allFiles.push(...req.files);
      } else {
        Object.values(req.files).forEach((arr) => allFiles.push(...arr));
      }
    }

    const uploaded = [];
    for (const f of allFiles) {
      const key = buildKey(f.fieldname, f.originalname);
      const readStream = new stream.PassThrough();
      readStream.end(f.buffer);
      const { url } = await uploadStream({
        key,
        body: readStream,
        contentType: f.mimetype,
      });
      uploaded.push({
        fieldname: f.fieldname,
        originalname: f.originalname,
        url,
        key,
      });
    }

    // group by fieldname
    req.uploadedFiles = uploaded.reduce((acc, cur) => {
      acc[cur.fieldname] = acc[cur.fieldname] || [];
      acc[cur.fieldname].push(cur);
      return acc;
    }, {});

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { productMedia, verificationDocs, pushToS3 };

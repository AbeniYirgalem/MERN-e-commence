const Product = require("../models/Product");

const list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({ data: products, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json({ data: p });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = req.body;
    // attach seller from token
    payload.sellerId = req.user.id;
    // if files were uploaded, attach media array
    if (req.uploadedFiles) {
      const media = [];
      if (req.uploadedFiles.images)
        req.uploadedFiles.images.forEach((f) =>
          media.push({ url: f.url, type: "image" })
        );
      if (req.uploadedFiles.video)
        req.uploadedFiles.video.forEach((f) =>
          media.push({ url: f.url, type: "video" })
        );
      payload.media = media;
    }
    const created = await Product.create(payload);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // only owner can update
    if (String(product.sellerId) !== String(req.user.id))
      return res.status(403).json({ message: "Forbidden" });

    Object.assign(product, req.body);
    await product.save();
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (String(product.sellerId) !== String(req.user.id))
      return res.status(403).json({ message: "Forbidden" });
    await product.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    const { q, minPrice, maxPrice, seller } = req.query;
    const filter = {};
    if (q)
      filter.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
      ];
    if (minPrice)
      filter.retailPrice = Object.assign({}, filter.retailPrice, {
        $gte: Number(minPrice),
      });
    if (maxPrice)
      filter.retailPrice = Object.assign({}, filter.retailPrice, {
        $lte: Number(maxPrice),
      });
    if (seller) filter.sellerId = seller;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ data: results, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, get, create, update, remove, search };

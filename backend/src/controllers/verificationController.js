const VerificationCase = require("../models/VerificationCase");

const createCase = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.sellerId = req.user.id;
    payload.status = "pending";
    // attach uploaded docs if present
    if (req.uploadedFiles && req.uploadedFiles.docs) {
      payload.docs = req.uploadedFiles.docs.map((f) => ({
        filename: f.originalname,
        url: f.url,
        key: f.key,
      }));
    }
    const v = await VerificationCase.create(payload);
    res.status(201).json({ data: v });
  } catch (err) {
    next(err);
  }
};

const getCase = async (req, res, next) => {
  try {
    const v = await VerificationCase.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Not found" });
    res.json({ data: v });
  } catch (err) {
    next(err);
  }
};

const approveCase = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { badgeTier = "bronze", notes } = req.body;
    const v = await VerificationCase.findById(id);
    if (!v) return res.status(404).json({ message: "Not found" });
    v.status = "approved";
    v.reviewerId = req.user.id;
    v.notes = notes || "";
    await v.save();

    // update seller profile badge
    const SellerProfile = require("../models/SellerProfile");
    await SellerProfile.findOneAndUpdate(
      { userId: v.sellerId },
      { badgeTier },
      { upsert: true }
    );

    res.json({ data: v });
  } catch (err) {
    next(err);
  }
};

const rejectCase = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { notes } = req.body;
    const v = await VerificationCase.findById(id);
    if (!v) return res.status(404).json({ message: "Not found" });
    v.status = "rejected";
    v.reviewerId = req.user.id;
    v.notes = notes || "";
    await v.save();
    res.json({ data: v });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCase, getCase, approveCase, rejectCase };

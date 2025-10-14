const Order = require("../models/Order");

const create = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.buyerId = req.user.id;
    payload.status = "pending";
    const order = await Order.create(payload);
    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let filter = {};
    if (role === "buyer") filter.buyerId = userId;
    else if (role === "seller") filter.sellerId = userId;
    // admin sees all
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, get, list, updateStatus };

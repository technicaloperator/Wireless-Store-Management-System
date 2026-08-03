import {
  fetchInventoryList,
  fetchInventoryItemById,
  insertInventoryItem,
  modifyInventoryItem,
  removeInventoryItem,
} from "../services/inventoryService.js";

export async function getInventoryList(req, res) {
  try {
    const items = fetchInventoryList();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getInventoryItemById(req, res) {
  try {
    const { id } = req.params;
    const item = fetchInventoryItemById(Number(id));

    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createInventoryItem(req, res) {
  try {
    const payload = req.body;
    const inserted = insertInventoryItem(payload);
    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = modifyInventoryItem(Number(id), payload);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = removeInventoryItem(Number(id));

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

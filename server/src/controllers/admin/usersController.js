const { User, TourCompany } = require('../../models');

async function getUsers(req, res) {
  try {
    const users = await User.find()
      .sort({ created_at: -1 })
      .select('id name email role blocked created_at');
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function blockUser(req, res) {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(404).json({ error: 'User not found or cannot block admin' });

    const updated = await User.findByIdAndUpdate(
      user._id,
      { blocked },
      { new: true }
    ).select('id name email blocked');
    if (!updated) return res.status(404).json({ error: 'User not found or cannot block admin' });
    return res.json({ user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(404).json({ error: 'User not found or cannot delete admin' });

    const deleted = await User.findByIdAndDelete(user._id);
    if (!deleted) return res.status(404).json({ error: 'User not found or cannot delete admin' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getUsers, blockUser, deleteUser };

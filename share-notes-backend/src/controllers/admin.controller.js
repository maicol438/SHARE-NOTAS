import User from '../models/User.js';
import Note from '../models/Note.js';

export const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalNotesTrash = await Note.countDocuments({ deletedAt: { $ne: null } });
    const notesLastWeek = await Note.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const usersLastWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      stats: {
        totalUsers,
        totalNotes,
        totalNotesTrash,
        notesLastWeek,
        usersLastWeek,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Rol actualizado', user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }

    await Note.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};

export const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({})
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

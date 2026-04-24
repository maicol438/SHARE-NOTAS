import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Note from "../models/Note.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const notesCount = await Note.countDocuments({
      user: req.userId,
      deletedAt: null,
    });
    const sharedCount = await Note.countDocuments({
      "sharedWith.user": req.userId,
      deletedAt: null,
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      stats: {
        totalNotes: notesCount,
        sharedWithMe: sharedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Se requiere contraseña actual" });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Contraseña actual incorrecta" });
      }

      user.password = newPassword;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingEmail) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      message: "Perfil actualizado",
      user: { name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: "URL de avatar requerida" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar },
      { new: true }
    );

    res.json({ message: "Avatar actualizado", user: { avatar: user.avatar } });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    await Note.deleteMany({ user: req.userId });

    await User.findByIdAndDelete(req.userId);

    res.clearCookie("token");
    res.json({ message: "Cuenta eliminada" });
  } catch (error) {
    next(error);
  }
};
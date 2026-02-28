import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All Fields are required" });

    const user = await User.findOne({
      email,
    });

    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.json({ message: "User Created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token });
  } catch (error) {}
};

const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) return res.status(404).json({ message: "User not found!" });

    user.profilePicture = req.file.filename;

    await user.save();
    return res.json({ message: "Profile picture updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { register, login, uploadProfilePicture, updateUserProfile };

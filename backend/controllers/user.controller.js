import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import ConnectionRequest from "../models/connections.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputFileName = `${crypto.randomBytes(32).toString("hex")}.pdf`;
  const outputPath = path.join("uploads", outputFileName);
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);
  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);
  doc.fontSize(14).text("Past Work: ");
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name:${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });
  doc.fontSize(14).text("Education: ");
  userData.education.forEach((edu, index) => {
    doc.fontSize(14).text(`School: ${edu.school}`);
    doc.fontSize(14).text(`degree: ${edu.degree}`);
    doc.fontSize(14).text(`Field of Study: ${edu.fieldOfStudy}`);
  });
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
  });

  return outputFileName;
};

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
    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
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
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token: token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    Object.assign(user, newUserData);
    await user.save();

    return res.json({ message: "User updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture",
    );

    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const sanitizeTextValue = (value) =>
      typeof value === "string" ? value.trim() : "";
    const sanitizeCollectionEntries = (items, fields) =>
      (Array.isArray(items) ? items : [])
        .map((item) => {
          const normalizedItem = fields.reduce(
            (accumulator, field) => ({
              ...accumulator,
              [field]: sanitizeTextValue(item?.[field]),
            }),
            item?._id ? { _id: item._id } : {},
          );

          return normalizedItem;
        })
        .filter((item) => fields.some((field) => item[field] !== ""));

    const userProfile = await User.findOne({ token: token });
    if (!userProfile)
      return res.status(404).json({ message: "User not found" });

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    const normalizedProfileData = { ...newProfileData };

    if ("bio" in newProfileData) {
      normalizedProfileData.bio = sanitizeTextValue(newProfileData.bio);
    }

    if ("pastWork" in newProfileData) {
      normalizedProfileData.pastWork = sanitizeCollectionEntries(
        newProfileData.pastWork,
        ["company", "position", "years"],
      );
    }

    if ("education" in newProfileData) {
      normalizedProfileData.education = sanitizeCollectionEntries(
        newProfileData.education,
        ["school", "degree", "fieldOfStudy"],
      );
    }

    Object.assign(profile_to_update, normalizedProfileData);
    await profile_to_update.save();

    return res.json({ message: "Profile updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username email profilePicture",
    );

    return res.json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserProfileWithUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture",
    );

    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadProfile = async (req, res) => {
  const userId = req.query.id;
  const userProfile = await Profile.findOne({ userId: userId }).populate(
    "userId",
    "name username email profilePicture",
  );

  let outputPath = await convertUserDataTOPDF(userProfile);
  return res.json({ message: outputPath });

  // return downloadable file instead of returning file name.
  // const outputPath = path.join("uploads", outputFileName);
  // return res.download(outputPath, outputFileName);
};

const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser)
      return res.status(404).json({ message: "Connection User not found" });

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest)
      return res.status(404).json({ message: "Request already sent" });

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await request.save();
    return res.json({ message: "Request Sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyConnectionsRequests = async (req, res) => {
  const token = req.query?.token || req.body?.token;
  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const whatAreMyConnections = async (req, res) => {
  const token = req.query?.token || req.body?.token;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    return res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connection = await ConnectionRequest.findOne({ _id: requestId });
    if (!connection)
      return res.status(404).json({ message: "Connection not found" });

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.json({ message: "Request Updated" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  getUserProfileWithUsername,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionsRequests,
  whatAreMyConnections,
  acceptConnectionRequest,
};

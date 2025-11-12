const user = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const nodemailer=require("nodemailer")
const crypto=require("crypto")
const resetmodel=require("../models/reset.model.js")

const transporter=nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.SENDER_MAIL,
    pass:process.env.SENDER_PASS
  }
})
console.log("Mail:", process.env.SENDER_MAIL);
console.log("Pass:", process.env.SENDER_PASS ? "✓ set" : "❌ missing");
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const useremail = await user.findOne({ email });
    if (useremail) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
        role: role || "user"
    });

    return res.status(200).json({ message: "User created successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password  } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existinguser = await user.findOne({ email });

    if (!existinguser) {
      return res.status(400).json({ message: "User not registered." });
    }

    const isMatch = await bcrypt.compare(password, existinguser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }
 
    const token=jwt.sign({
        id:existinguser._id, email:existinguser.email},
        process.env.JWT_SECRET,
        {expiresIn : "1h"}

    )

    return res.status(200).json({ message: "User logged in successfully." , token, role:existinguser.role, name :existinguser.name});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const forgetpass = async (req, res) => {
  try {
    const { email } = req.body;


    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

  
    const token = crypto.randomBytes(32).toString("hex");
    


    await resetmodel.deleteMany({ userId: existingUser._id });

 
    const newreset = new resetmodel({
      userId: existingUser._id,
      reset_token: token,
    });
    await newreset.save();


    await transporter.sendMail({
      to: existingUser.email,
      subject: "Password Reset Link - OR Generator",
      html: `
        <h2>Click the link below to reset your password:</h2>
        <a href="${process.env.CLIENT_URL}/reset/${token}" target="_blank">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({ message: "Reset password link sent to your email." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resetpass = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;


    const resettoken = await resetmodel.findOne({ reset_token: token });
    if (!resettoken) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    await user.findByIdAndUpdate(
      resettoken.userId,
      { password: hashedPassword },
      { new: true }
    );

  
    await resetmodel.deleteOne({ reset_token: token });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


module.exports = {
  register,
  login,
  forgetpass,
  resetpass
};

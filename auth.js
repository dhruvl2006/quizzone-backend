const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Admin = require("./models/admin.model");
const Student = require("./models/student.model");
const QuizInfo = require("./models/quizinfo.model");
const SCQ = require("./models/scq.model");
const bcrypt = require("bcrypt");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  const allowedOrigins = ["*"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
});

const db = mongoose.connection;
db.on("error", (error) => console.error("Connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, "secret123", (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

app.post("/adminsignup", async (req, res) => {
  if (req.body.password !== req.body.confirmpass) {
    return res
      .status(400)
      .json({ status: "error", error: "Passwords do not match" });
  }
  try {
    console.log(req.body);
    const existingAdmin = await Admin.findOne({
      adminemail: req.body.adminemail,
    });
    if (existingAdmin) {
      throw new Error("Admin with this email already exists.");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await Admin.create({
      adminname: req.body.adminname,
      adminemail: req.body.adminemail,
      password: hashedPassword,
    });
    res.status(201).json({ status: "ok" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.post("/adminlogin", async (req, res) => {
  try {
    const admin = await Admin.findOne({ adminemail: req.body.adminemail });

    if (!admin) {
      return res.json({
        status: "error",
        user: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, admin.password);

    if (isMatch) {
      const token = jwt.sign(
        {
          name: admin.adminname,
          email: admin.adminemail,
        },
        process.env.JWT_SECRET
      );
      return res.json({
        status: "ok",
        user: token,
        username: admin.adminname,
        useremail: admin.adminemail,
      });
    } else {
      return res.json({ status: "error", user: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.post("/studentsignup", async (req, res) => {
  if (req.body.password !== req.body.confirmpass) {
    return res
      .status(400)
      .json({ status: "error", error: "Passwords do not match" });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await Student.create({
      studentname: req.body.studentname,
      studentemail: req.body.studentemail,
      password: hashedPassword,
    });
    res.status(201).json({ status: "ok" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json({ status: "error", error: "Duplicate email" });
    } else {
      res.status(500).json({ status: "error", error: "Server error" });
    }
  }
});

app.post("/studentlogin", async (req, res) => {
  try {
    const student = await Student.findOne({
      studentemail: req.body.studentemail,
    });

    if (!student) {
      return res.json({
        status: "error",
        user: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, student.password);

    if (isMatch) {
      const token = jwt.sign(
        {
          name: student.studentname,
          email: student.studentemail,
        },
        process.env.JWT_SECRET
      );

      return res.json({
        status: "ok",
        user: token,
        username: student.studentname,
        useremail: student.studentemail,
      });
    } else {
      return res.json({
        status: "error",
        user: false,
        message: "Invalid email or password",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.post("/quiz-data", async (req, res) => {
  try {
    const quiz = await QuizInfo.create({
      quizTitle: req.body.quizTitle,
      quizDescription: req.body.quizDescription,
      questionTime: req.body.questionTime,
      code: req.body.code,
      email: req.body.email,
    });
    res.status(201).send({ message: "Quiz added" });
  } catch (err) {
    console.error(err);
    res.status(400).send({ status: "code already in use" });
  }
});

app.post("/quizes", async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const getQuiz = await QuizInfo.find({ email: email });
    console.log(getQuiz);
    return res.json({ status: "ok", quiz: getQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.get("/quiz/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const quiz = await QuizInfo.findOne({
      code: id,
    });
    res.status(201).send({ quiz: quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.delete("/quiz-data-delete", async (req, res) => {
  try {
    const quiz = await QuizInfo.deleteOne({
      _id: req.body.id,
    });

    if (quiz.deletedCount > 0) {
      res.status(200).send({ status: "ok", message: "Quiz deleted" });
    } else {
      res.status(404).send({ status: "error", message: "Quiz not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.patch("/quiz-data-update", async (req, res) => {
  try {
    const quiz = await QuizInfo.findByIdAndUpdate(req.body._id, {
      quizTitle: req.body.quizTitle,
      quizDescription: req.body.quizDescription,
      questionTime: req.body.questionTime,
      code: req.body.code,
    });
    res.status(201).send({ status: "ok", message: "Quiz updated", quiz: quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.post("/quiz/questions/scq", async (req, res) => {
  try {
    const newQuestion = req.body;
    const createdQuestion = await SCQ.create(newQuestion);
    res.status(201).send({ status: "ok", question: createdQuestion });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      res.status(400).json({
        status: "error",
        message: "Validation Error",
        error: err.message,
      });
    } else if (err.code === 11000) {
      res.status(500).json({ status: "error", message: "Duplicate Key Error" });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Server Error", error: err.message });
    }
  }
});

app.get("/quizQuestions/scq/:code", async (req, res) => {
  try {
    const { code } = req.params;
    let getQuestions;
    if (code) {
      getQuestions = await SCQ.find({ code: code });
      console.log(getQuestions);
    } else {
      getQuestions = await SCQ.find({});
    }
    res.json({ status: "ok", questions: getQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.delete("/quizQuestion-delete/scq/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await SCQ.findByIdAndDelete(id);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.put("/quizQuestion-update/scq/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const newQuestion_update = req.body;
    await SCQ.findByIdAndUpdate(id, newQuestion_update);
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.get("/getQuiz/:testcode", async (req, res) => {
  try {
    const testcode = req.params.testcode;
    const quiz = await QuizInfo.findOne({ code: testcode });
    res.status(201).send({ status: "ok", quiz: quiz });
  } catch (error) {
    console.log(error);
  }
});

app.get("/questions/:testcode", async (req, res) => {
  try {
    const { testcode } = req.params;
    const getQuestions = await SCQ.find({ code: testcode });
    res.json({ status: "ok", questions: getQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Server error" });
  }
});

app.get("/", async (req, res) => {
  try {
    res.json({ message: "Server is running" });
  } catch (error) {}
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

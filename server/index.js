const express = require("express"); //引入express板块

const cors = require("cors"); //引入cors板块解决跨域
const multer = require("multer"); //用于处理表单数据，主要用于上传文件
const path = require("path"); //用来处理路径的模块
let chatRequestCount = 0;
let createRequestCount = 0;
let lastChatResetTime = Date.now();
let lastCreateResetTime = Date.now();
function checkAndLimitChatRequests() {
  const currentTime = Date.now();
  const oneMinuteAgo = currentTime - 60 * 1000;
  // 如果上一次重置时间是在一分钟之前
  if (lastChatResetTime < oneMinuteAgo) { 
    chatRequestCount = 0; // 重置聊天接口请求次数
    lastChatResetTime = currentTime; // 更新重置时间
  }
  return chatRequestCount < 3;
}

function checkAndLimitCreateRequests() {
  const currentTime = Date.now();
  const oneMinuteAgo = currentTime - 60 * 1000;

  if (lastCreateResetTime < oneMinuteAgo) { // 如果上一次重置时间是在一分钟之前
    createRequestCount = 0; // 重置创建简历接口请求次数
    lastCreateResetTime = currentTime; // 更新重置时间
  }

  return createRequestCount < 3;
}

const { Configuration, OpenAIApi } = require("openai");
let messageArr = [];
const configuration = new Configuration({
  apiKey: "key",
});

const mysql = require("mysql"); //引入mysql 模块
const { log } = require("console");
// 创建数据库连接 填入数据库信息
const conn = mysql.createConnection({
  user: "chathub", //用户名
  password: "1234", //密码
  host: "152.136.42.72", //主机（默认都是local host）
  database: "chathub", //数据库名
});
// 尝试连接数据库
conn.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL server.');
});
module.exports = conn;

const openai = new OpenAIApi(configuration);

const GPTFunction = async (text) => {
  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo-instruct",
    prompt: text,
    max_tokens: 2048, //最多返回数
    top_p: 1, //随机情况
    frequency_penalty: 1, //减少模型重复
    presence_penalty: 1, //模型讨论新主题的可能性
  });
  return response.data.choices[0].text;
};

const GPTFunction2 = async (textArr) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: textArr,
  })
  const result = completion.data.choices[0].message.content;
  return result;
};



let database = [];
let id = 1;

const PORT = 4000;
const app = new express(); //创建实例

app.use(express.urlencoded({ extended: true })); //加载解析urlencoded请求体的中间件。
app.use(express.json()); //加载解析json的中间件
app.use(cors()); //cors板块解决跨域
app.use("/uploads", express.static("uploads"));
app.use(express.static(__dirname + "/build"));
// app.use(express.static(__dirname));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

app.get("/", function (req, res) {
  res.json({
    message: "Hello World",
  });
});
//查询访问密码数据库里有没有
app.post("/affirm", upload.single("headshotImage"), async (req, res) => {
  const {
    secret, //密码
  } = req.body;
  let flag = "false";
  const sqlStr = "select * from message where replyMsg=?";
  conn.query(sqlStr, secret, (err, result) => {
    if (err) return console.log(err);
    if (result[0]) {
      res.json({
        message: "Request successful!",
        flag: "true",
      });
    } else {
      res.json({
        message: "Request successful!",
        flag: "false",
      });
    }
  });
});

// 包裹原有路由处理器
app.post("/resume/chat", upload.single("headshotImage"), async (req, res) => {
  //判断请求是否超过服务器限制
  if (!checkAndLimitChatRequests()) {
    return res.json({ status:429,message: '“/resume/chat” API 调用次数超过限制，请稍后再试' });
  }
  //上传聊天记录返回答案
  const handleChatRequest = async () => {
    const {
      question,//问题
    } = req.body;
    messageArr.push({ role: "user", content: question });
    const answer = await GPTFunction2(messageArr);
    messageArr.push({ role: "assistant", content: answer });
    res.json({
      status:200,
      message: "Request successful!",
      answer,
    });
  };

  try {
    chatRequestCount++;//每次调用接口次数加1
    await handleChatRequest();
  } catch (error) {
    console.error(error);
    res.json({ status:500,message: '服务器内部错误' });
  }
});

// 包裹原有路由处理器 - 创建简历接口
app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
  if (!checkAndLimitCreateRequests()) {
    return res.json({ status:429,message: '“/resume/chat” API 调用次数超过限制，请稍后再试' });
  }

  const handleCreateRequest = async () => {
    const {
      fullName,
      currentPosition,
      currentLength,
      currentTechnologies,
      workHistory,
    } = req.body;
    const workArray = JSON.parse(workHistory); // 将字符串信息变成数组信息

    // 循环遍历 workArray 中的项并将它们转换为字符串
    const remainderText = () => {
      let stringText = "";
      for (let i = 0; i < workArray.length; i++) {
        stringText += ` ${workArray[i].name}(${workArray[i].position}),`;
      }
      return stringText;
    };

    // 简介
    const prompt1 = `我正在写一份简历, 我的信息有 \n 名字: ${fullName} \n 职位: ${currentPosition} (${currentLength} 年). \n 我具有这些技术: ${currentTechnologies}. 可以用第一人称在简历的最上面帮我写100字的描述吗?`;
    // 工作技能
    const prompt2 = `我正在写一份简历, 我的信息有 \n 名字: ${fullName} \n 职位: ${currentPosition} (${currentLength} 年). \n 我具有这些技术: ${currentTechnologies}. 你可以为我的简历写10点关于我擅长什么吗?每点字数请务必控制在25到35字之间。`;
    // 工作经历/简介
    const prompt3 = `我正在写一份简历, 我的信息有 \n 名字: ${fullName} \n 职位: ${currentPosition} (${currentLength} 年). \n 我曾经在这 ${
      workArray.length
    } 个公司工作: ${remainderText()} \n 你可以用第一人称为我的简历书写150字我对这些公司的贡献吗?我需要和你强调的是，你只需要书写成一段文字，请不要分成多段书写。`;
    console.log(prompt3);

    // 得到GPT3的结果
    const objective = await GPTFunction(prompt1);//简介
    const keypoints = await GPTFunction(prompt2);//工作技能
    const jobResponsibilities = await GPTFunction(prompt3);//工作经历/简介

    // 放到对象里
    const newEntry = {
      id: id++,
      fullName,
      image_url: `http://43.135.135.83:4000/uploads/${req.file.filename}`,
      currentPosition,
      currentLength,
      currentTechnologies,
      workHistory: workArray,
    };

    const data = { ...newEntry, objective, keypoints, jobResponsibilities };
    database.push(data);

    res.json({
      status:200,
      message: "Request successful!",
      data,
    });
  };

  try {
    await handleCreateRequest();
    createRequestCount=createRequestCount+3;
  } catch (error) {
    // 错误处理...
    console.error(error);
    res.json({status:500, message: '服务器内部错误' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

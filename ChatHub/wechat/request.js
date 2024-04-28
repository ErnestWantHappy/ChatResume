// const fetch = require("node-fetch");
// const { Configuration, OpenAIApi } = require("openai");
// // 机器人接口的API，此处使用的青云客机器人，也可以使用其他的API
// const URL = "http://api.qingyunke.com/api.php?key=free&appid=0&msg=";

// module.exports = (payload) => {
//   /**
//    * 根据自己想用的 API 接口规范进行更改即可，不用 chatGPT 是因为微信
//    * 官方要求必须在5秒内回复，否则就报错，所以大部分情况都会报错，所以我就
//    * 放弃使用这个了，国内也有很多好用的 AI 接口，比如青云客就是免费的，其
//    * 他的接口或多或少都要收费，这个算良心了。
//    */

//   //leon
//   //   const configuration = new Configuration({
//   //     apiKey: 'apikey',
//   //   });
//   //   const openai = new OpenAIApi(configuration);

//   //   return openai.createCompletion({
//   //     model: "text-davinci-003",
//   //     prompt: payload.msg,
//   //     max_tokens: 10,
//   //     stop: ["{}"]
//   //   })
//   //   .then(completion => {console.log(completion.data.choices[0].text)})
//   //   .catch(err => console.log(`error: ${err.text}`))

//   //青云客
//   return fetch(`${URL}${encodeURI(payload.msg)}`)
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(
//           `unexpected HTTP error createConversation ${res.status}: ${res.statusText}`
//         );
//       } 
//       return res.json();
//     })
//     .then((json) => {
//       //console.log(json)
//       const result = json.content.replaceAll("{br}", "\n");
//       //console.log(result);
//       return result;
//     });

//   //try
//   // const { Configuration, OpenAIApi } = require("openai");

//   // const configuration = new Configuration({
//   //     apiKey: 'apikey',
//   // });
//   // const openai = new OpenAIApi(configuration);

//   // async function play () {
//   // const completion =  await openai.createChatCompletion({
//   //     model: "gpt-3.5-turbo",
//   //     messages: [{role: "user", content: "Hello world"}],
//   // });
//   // console.log(completion.choices[0]);
//   // return completion.choices[0].message.content;
//   // }
//   // play();

//   // var axios = require("axios");
//   // var data = JSON.stringify({
//   //   apiKey: 'apikey',
//   //   organization:"org-LhlVvR7Zhyaufzhc0R1Nui5j",
//   //   sessionId: "8d1cb9b0-d535-43a8-b738-4f61b1608579",
//   //      content: "你是谁？",
//   // });
//   // var Config = {
//   //   method: "post",
//   //   maxBodyLength: Infinity,
//   //   url: "https://api.openai.com/v1/chat/completions",
//   //  headers: { "Content-Type": "application/json" },
//   //   data: data,
//   // };
//   // axios(Config)
//   //   .then(function (response) {
//   //       return JSON.stringify(response.data);
//   //     console.log(JSON.stringify(response.data));
//   //   })
//   //   .catch(function (error) {
//   //     console.log(error);
//   //   });

//   //}

//   //   const configuration = new Configuration({
//   //     apiKey: "key",
//   //   });
//   //   const openai = new OpenAIApi(configuration);

//   //   return openai.createCompletion({
//   //     model: "text-davinci-003",
//   //     prompt: payload.msg,
//   //     max_tokens: 512,
//   //     stop: ["{}"]
//   //   })
//   //   .then(completion => {console.log(completion.data.choices[0].text)})
//   //   .catch(err => console.log(`error: ${err.message}`))

//   // return fetch(`${URL}${encodeURI(payload.msg)}`)
//   //   .then(res => {
//   //     if (!res.ok) {
//   //       throw new Error(
//   //         `unexpected HTTP error createConversation ${res.status}: ${res.statusText}`
//   //       )
//   //     }
//   //     return res.json()
//   //   })
//   //   .then(json => {
//   //     console.log(json)
//   //     const result = json.content.replaceAll('{br}', '\n');
//   //     return result;
//   //   })
// };

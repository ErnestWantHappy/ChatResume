const sha1 = require("sha1");
const { TOKEN } = require("../config.js");
const {
    getUserDataAsync,
    parseXMLAsync,
    formatMessage,
} = require("./utils.js");
const template = require("./template.js");
const conn = require("../index.js");
function random(length) {
    let numbers = '0123456789';                  //指定数字范围，
    let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';  //指定字母范围，（也可以指定字符或者小写字母）
    let total = '';
    total += numbers += letters;            //将数字和字母合并成一个字符串
    let result = '';
    //从合并的字符串里随机取出一个值
    while (length > 0) { //循环次数是指定长度
        length--;
        result += total[Math.floor(Math.random() * total.length)];
    }
    return result;
}
module.exports = () => {
    return async (req, res) => {
        /**
         * 验证签名步骤:
         * 1.先将 timestamp, nonce, TOKEN 按字典排序并组合成一个字符串
         * 2.然后对得到的字符串进行 sha1 加密
         * 3.最后将加密得到的字符串与 signature 进行对比，如果相同则验证通过
         */
        const { query, method } = req;
        //console.log(query);
        // {    query格式如下
        //     signature: '6d35c950ef450598e52f764caceb26c0edb86660',
        //     timestamp: '1682135944',
        //     nonce: '619212066',
        //     openid: 'o_Nhp5hGbDUcNAPOeGO82sSNBV_w'
        //     }
        const { signature, timestamp, nonce, echostr } = query;
        const sha1str = sha1([timestamp, nonce, TOKEN].sort().join("")); //.sort()是字典排序方法，.join('')字符串拼接
        if (method === "GET") {
            // GET 请求验证服务器有效性 (只有验证token的时候才会有get请求？)
            //console.log(signature);
            //console.log(sha1str);
            if (signature === sha1str) {
                console.log("echostr" + echostr);
                res.send(echostr); //发送echostr给微信服务器
            } else {
                res.end("error1");
            }
        } else if (method === "POST") {
            // 微信服务器发送消息
            if (signature !== sha1str) res.end("error2");
            // req.query中的openid为用户的id
            //console.log('req'+req);
            const xmlData = await getUserDataAsync(req); // 获取xml数据
            console.log('xmlData' + xmlData);
            //以下是xmlData的格式
            //       <xml><ToUserName><![CDATA[gh_d253e7e6c836]]></ToUserName>
            // <FromUserName><![CDATA[o_Nhp5hGbDUcNAPOeGO82sSNBV_w]]></FromUserName>
            // <CreateTime>1682138532</CreateTime>
            // <MsgType><![CDATA[text]]></MsgType>
            // <Content><![CDATA[你好]]></Content>
            // <MsgId>24082432757757145</MsgId>
            // </xml>
            const jsData = await parseXMLAsync(xmlData); // 将xml转化为js对象
            console.log('jsData',jsData)
            const message = formatMessage(jsData); // 格式化xml对象
            console.log('message',message);
            const options = {
                type: "text",
                to: message.FromUserName,
                from: message.ToUserName,
            };
            //console.log(options);
            options.msg = "不支持回复该类型的消息";
            // 回复文本消息，message.Content为内容
            const MsgType = message.MsgType;
            

            if (MsgType === "text") {
                if (message.Content === "我要生成智能简历") {
                    options.msg = await random(5);
                    console.log(options.msg);
                    //数据表message插入操作id
                    const msg = {
                        userName: message.FromUserName,//用户id
                        officialName: message.ToUserName,//公众号id
                        sendMsg: message.Content,//发送信息
                        replyMsg: options.msg//回复信息
                    }
                    const sqlStr = 'insert into message(userName,officialName,sendMsg,replyMsg) values(?,?,?,?)';
                    conn.getConnection(function (err, connection) {
                        if (err) {
                            console.log("建立连接失败",err);
                        } else {
                            console.log("建立mysql连接成功");
                            connection.query(sqlStr, [msg.userName, msg.officialName, msg.sendMsg, msg.replyMsg], function (err, result) {
                                if (err) {
                                    console.log("插入失败", err);
                                } else {
                                    if (result.affectedRows === 1) {
                                        console.log("数据插入成功");
                                    }
                                }
                                connection.release();
                            })
                        }
                    })
                } else {
                    options.msg = "想获得智能简历生成器(http:43.135.135.83:4000)使用？需要您输入一个访问密码，想获得访问密码？需要那就请输入：我要生成智能简历"
                }
            } else if (MsgType === "event"&&message.Event === "subscribe") {
            options.msg = `需要使用智能简历生成器?请使用电脑游览器打开如下网址 http:43.135.135.83:4000 ，需要系统的访问密码，请在此公众号发送消息：我要生成智能简历`;
            }

            /**
             * 可以自定义其他类型的数据，模板已经在template.js中给出
             * 参考官方文档:
             *   https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html#0
             */
            // 如果用户发送其他类型的消息则返回错误
            //查询表
            console.log(message.Content)

            res.send(template(options)); //template将他转换成了微信格式的消息
        } else {
            res.end("error0");
        }
    };
};

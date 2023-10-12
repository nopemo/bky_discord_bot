const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const client = new discord.Client();
let serverList = new Array();
let statusList = new Array();

let URL = "https://cdn.glitch.com/3c5b29d3-7412-4e6d-a0b6-baa71617d294%2F"
//テキストリスト
let stampList = ["🚢", "🦐", "🐑", "🧼"]
let msgList = [
  "サーバー再起動のため進捗がリセットされました。\n【たたかう】と入力してください",
  "進捗がリセットされました。\n再度挑戦する場合は【たたかう】と入力してください。",
  "SPで対戦したい場合は【たたかう】と入力して下さい。\n\n答え方は全て『ひらがな』です。\n表示されている最新の問題画像を答えて下さい。\n【】で括られた文字は入力可能です。\n\n全6問の問題画像に正解した時点で貴方の勝利となります。\n※構造的に入力から時間がかかる場合があります。\n※定期的にサーバーが再起動するので、進捗がリセットされます。\n※応答がない、困った、よりヒントが欲しい等の場合は、@mozukuzukushiまで。",
  "正解です。\nコマンド【すてっぷ】が使用可能となりました。\n",
  "【すてっぷ】を使用します。",
  "正解です。\nコマンド【すとっぷ】が使用可能となりました。\n",
  "【すとっぷ】を使用します。",
  "正解です。\nコマンド【すわっぷ】が使用可能となりました。\n",
  "【すわっぷ】を使用します。",
  "正解です。\nコマンド【すきっぷ】が使用可能となりました。\n",
  "【すきっぷ】を使用します。",
  "正解です。\nコマンド【すたんぷ】が使用可能となりました。\n",
  "【すたんぷ】を使用します。",
  "正解です。\nコマンド【すまっぷ】が使用可能となりました。\n",
  "【すまっぷ】を使用します。",
  "終了です。\nスコアは",
  "/6です。\n\n再度挑戦する場合は【たたかう】と入力。\nヒントが欲しい場合は【ひんと】と入力。",
  "/6です。\n\n貴方の勝利です。\nおめでとうございます。\n\nSkiP、SteP、SmaP、StamP、そしてStoP\nSとPが重要となる謎解きでした。\n他のハッカソン謎解きも遊んでみて下さいね。\n\n再度挑戦する場合は【たたかう】と入力。",
  "自動送信はストップしています。",
  "無効なコマンドです。",
  "詰み状態です。\n【おーるりせっと】と入力してください。",
  "・小謎の答えが分からない場合→【こな】\n・問題が送信されなくなった場合→【とま】\n・問題を全て答えられない場合→【むり】\n(謎には一切関係がありません。)",
  "『す』で始まり『ぷ』で終わる4文字の単語が答えです。",
  "【すわっぷ】を上手く使って【すきっぷ】を最後に答えましょう。",
  "現在使用可能と言われているコマンドを上手く活用しましょう。",
  "自動送信をストップさせます。",
  "https://bunshun.jp/articles/-/47489"
];

http.createServer(function (req, res) {
  if (req.method == 'POST') {
    var data = "";
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      if (!data) {
        res.end("No post data");
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if (dataObject.type == "wake") {
        console.log("Woke up in post");
        res.end();
        return;
      }
      res.end();
    });
  }
  else if (req.method == 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message => {
  console.log('Bot準備完了～');
});

client.on("guildCreate", guild => {
  let c_channelID;
  let c_channels = guild.channels;
  channelLoop:
  for (let c of c_channels) {
    let c_channelType = c[1].type;
    if (c_channelType === "text") {
      c_channelID = c[0];
      break channelLoop;
    }
  }
  let c_channel = client.channels.get(guild.systemChannelID || c_channelID);
  c_channel.send(`サーバーへの招待、ありがとうございます。\n\n` + msgList[0]);
  if (!serverList.includes(c_channelID)) {
    serverList.push(c_channelID);
    statusList.push("init");
    console.log(c_channelID);
  }
});

client.on('message', message => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  else if (!serverList.includes(message.channel.id) || statusList[serverList.indexOf(message.channel.id)] == -2) {
    sendMsg(message.channel.id, msgList[0]);
    serverList.push(message.channel.id);
    statusList.push("init");
    console.log(message.channel.id);
    return;

  }
  else if (message.content.match(/^おーるりせっと|オールリセット|all.*reset$/)) {
    if (!serverList.includes(message.channel.id)) {
      serverList.push(message.channel.id);
      statusList.push("init");
    } else {
      let serverId = serverList.indexOf(message.channel.id);
      statusList[serverId] = "init";
    }
    sendMsg(message.channel.id, msgList[1]);
    return;
  }
  else if (message.content.match(/^しょしょしょしょせってい$/)) {
    sendMsg(message.channel.id, message.channel.id);
    let serverId = serverList.indexOf(message.channel.id);
    sendMsg(message.channel.id, statusList[serverId]);
    sendMsg(message.channel.id, msgList[26]);
    return;
  }
  else if (message.content.match(/^ひんと|ヒント|hint$/)) {
    sendMsg(message.channel.id, msgList[21]);
  }
  else if (message.content.match(/^こな|コナ|粉|kona$/)) {
    sendMsg(message.channel.id, msgList[22]);
  }
  else if (message.content.match(/^とま|トマ|苫|toma$/)) {
    sendMsg(message.channel.id, msgList[24]);
  }
  else if (message.content.match(/^むり|ムリ|無理|muri$/)) {
    sendMsg(message.channel.id, msgList[23]);
  }
  else if (statusList[serverList.indexOf(message.channel.id)].match(/init/)) {
    if (message.content.match(/^たたかう|タタカウ|戦う|fight$/)) {
      let serverId = serverList.indexOf(message.channel.id);
      statusList[serverId] = "ぬ00000061000010";
      sendFile(message.channel.id, "sp" + statusList[serverId].slice(8, 9))
      console.log(statusList[serverId]);
      const testinterval = setInterval(function () {
        if (statusList[serverId] === "init") {
          clearInterval(testinterval);
        } else if (statusList[serverId].slice(2, 3) === "1") {
          clearInterval(testinterval);
        } else if (statusList[serverId].slice(14) === "0") {
          sp_step(serverId, message.channel.id);
          if (statusList[serverId] != "init") {
            statusList[serverId] = statusList[serverId].slice(0, 14) + "0";
          }
        } else if (statusList[serverId].slice(14) === "1") {
          console.log("インターバル入ります。");
          statusList[serverId] = statusList[serverId].slice(0, 14) + "0";
        }
      }, 10000);
      return;
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
  }
  else if (message.content.match(/^すてっぷ|ステップ|step$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(1, 2) === "0" && statusList[serverId].slice(8, 9) === "1") {
      sendMsg(message.channel.id, msgList[3] + msgList[4]);
      sp_step(serverId, message.channel.id);
      statusList[serverId] = statusList[serverId].slice(0, 1) + "1" + statusList[serverId].slice(2)
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(1, 2) === "1") {
      sendMsg(message.channel.id, msgList[4]);
      sp_step(serverId, message.channel.id);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else if (message.content.match(/^すとっぷ|ストップ|stop$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(2, 3) === "0" && statusList[serverId].slice(8, 9) === "2") {
      sendMsg(message.channel.id, msgList[5] + msgList[6]);
      sendMsg(message.channel.id, msgList[25]);
      sp_stop(serverId, message.channel.id);
      statusList[serverId] = statusList[serverId].slice(0, 2) + "1" + statusList[serverId].slice(3)
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(2, 3) === "1") {
      sendMsg(message.channel.id, msgList[6]);
      sendMsg(message.channel.id, msgList[18]);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else if (message.content.match(/^すわっぷ|スワップ|swap$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(3, 4) === "0" && statusList[serverId].slice(8, 9) === "3") {
      sendMsg(message.channel.id, msgList[7] + msgList[8]);
      sp_swap(serverId, message.channel.id);
      statusList[serverId] = statusList[serverId].slice(0, 3) + "1" + statusList[serverId].slice(4)
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(3, 4) === "1") {
      sendMsg(message.channel.id, msgList[8]);
      sp_swap(serverId, message.channel.id);
      console.log(statusList[serverId]);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else if (message.content.match(/^すきっぷ|スキップ|skip$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(4, 5) === "0" && statusList[serverId].slice(8, 9) === "4") {
      sendMsg(message.channel.id, msgList[9] + msgList[10]);
      statusList[serverId] = statusList[serverId].slice(0, 4) + "1" + statusList[serverId].slice(5)
      sp_skip(serverId, message.channel.id);
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(4, 5) === "1") {
      sendMsg(message.channel.id, msgList[10]);
      sp_skip(serverId, message.channel.id);
      console.log(statusList[serverId]);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else if (message.content.match(/^すたんぷ|スタンプ|stamp$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(5, 6) === "0" && statusList[serverId].slice(8, 9) === "5") {
      sendMsg(message.channel.id, msgList[11] + msgList[12]);
      sp_stamp(serverId, message.channel.id, message);
      statusList[serverId] = statusList[serverId].slice(0, 5) + "1" + statusList[serverId].slice(6)
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(5, 6) === "1") {
      sendMsg(message.channel.id, msgList[12]);
      sp_stamp(serverId, message.channel.id, message);
      console.log(statusList[serverId]);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else if (message.content.match(/^すまっぷ|スマップ|smap$/)) {
    let serverId = serverList.indexOf(message.channel.id);
    if (statusList[serverId].slice(6, 7) === "0" && statusList[serverId].slice(8, 9) === "6") {
      sendMsg(message.channel.id, msgList[13] + msgList[14]);
      sp_smap(serverId, message.channel.id, message);
      statusList[serverId] = statusList[serverId].slice(0, 6) + "1" + statusList[serverId].slice(7)
      console.log(statusList[serverId]);
    } else if (statusList[serverId].slice(6, 7) === "1") {
      sendMsg(message.channel.id, msgList[14]);
      sp_smap(serverId, message.channel.id, message);
      console.log(statusList[serverId]);
    } else {
      sendMsg(message.channel.id, msgList[19]);
    }
    return;
  }
  else {
    sendMsg(message.channel.id, msgList[19]);
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log('DISCORD_BOT_TOKENが設定されていません。');
  process.exit(0);
}
client.login(process.env.DISCORD_BOT_TOKEN);

function sendMsg(channelId, text, option = {}) {
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendFile(channelId, filename, option = {}) {
  let filePath = URL + filename + ".png";
  client.channels.get(channelId).send({ files: [filePath] })
    .then(console.log("ファイル送信: " + filename + JSON.stringify(option)))
    .catch(console.error);
}

function sp_step(serverId, channelId, option = {}) {
  console.log("stepを使用します。");
  statusList[serverId] =
    statusList[serverId].slice(0, 7) +
    statusList[serverId].slice(8, 9) +
    (Number(statusList[serverId].slice(13, 14)) + 1) +
    statusList[serverId].slice(9, 13) +
    (Number(statusList[serverId].slice(13, 14)) + 1) +
    "1";
  console.log(statusList[serverId]);
  if (Number(statusList[serverId].slice(13, 14)) < 7) {
    sendFile(channelId, "sp" + statusList[serverId].slice(8, 9));
  } else {
    let sum_correct;
    sum_correct = (statusList[serverId].slice(1, 7).match(/1/g) || []).length;
    statusList[serverId] = "init";
    if (sum_correct < 6) {
      sendMsg(channelId, msgList[15] + sum_correct + msgList[16])
    } else {
      sendMsg(channelId, msgList[15] + sum_correct + msgList[17])
      sendFile(channelId, "clear");
    }
  }
}

function sp_stop(serverId, channelId, option = {}) {
  console.log("stopを使用します。");
  console.log(statusList[serverId]);
  if (statusList[serverId].slice(1, 2) === "0") {
    sendMsg(channelId, msgList[20]);
  }
}

function sp_swap(serverId, channelId, option = {}) {
  console.log("swapを使用します。");
  statusList[serverId] = statusList[serverId].slice(0, 7) + statusList[serverId].slice(8, 9) + statusList[serverId].slice(7, 8) + statusList[serverId].slice(9);
  console.log(statusList[serverId]);
  sendFile(channelId, "sp" + statusList[serverId].slice(8, 9));
}

function sp_skip(serverId, channelId, option = {}) {
  console.log("skipを使用します。");
  let sum_correct;
  sum_correct = (statusList[serverId].slice(1, 7).match(/1/g) || []).length;
  statusList[serverId] = "init";
  if (sum_correct < 6) {
    sendMsg(channelId, msgList[15] + sum_correct + msgList[16])
  } else {
    sendMsg(channelId, msgList[15] + sum_correct + msgList[17])
    sendFile(channelId, "clear");
  }
}

function sp_stamp(serverId, channelId, stamp_message, option = {}) {
  console.log("stampを使用します。");
  stamp_message.react(stampList[Math.floor(Math.random() * 4)])
    .catch(console.error);
  console.log(statusList[serverId]);
}

function sp_smap(serverId, channelId, option = {}) {
  console.log("smapを使用します。");
  if (statusList[serverId].slice(9, 11) === "00") {
    sendFile(channelId, "smap" + ("0" + (1 + Math.floor(Math.random() * 11))).slice(-2));
  } else {
    sendFile(channelId, "smap" + statusList[serverId].slice(9, 11));
  }
  statusList[serverId] = statusList[serverId].slice(0, 9) + ("0" + (Number(statusList[serverId].slice(9, 11)) + 1) % 13).slice(-2) + statusList[serverId].slice(11);
}

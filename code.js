const { ButtonBuilder, ButtonStyle, Client, MessageButton, MessageActionRow } = require("discord.js");
const options = { intents: ["GUILDS", "GUILD_MESSAGES"] };
const client = new Client(options);
const secsIter = ['120', '90', '60', '45', '180'];
const dirIter = ['left', 'middle', 'right'];
let statusList = {};
function sendMsg(channelId, text, option = {}) {
  client.channels.cache.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function valueExists(value, obj) {
  return Object.values(obj).includes(value);
}

function findKeyByValue(value, obj) {
  return Object.keys(obj).find(key => obj[key] === value);
}

class Status {
  constructor() {
    this.status = "init";
    this.is_sents = { "120": false, "90": false, "60": false, "45": false, "180": false };
    this.is_movings = { "120": false, "90": false, "60": false, "45": false, "180": false };
    this.passed_time = { "120": 0, "90": 0, "60": 0, "45": 0 };
  };
  setStatus(status) {
    this.status = status;
  };
  getStatus() {
    return this.status;
  };
  setSent(button_name, is_sent) {
    this.is_sents[button_name] = is_sent;
  };
  getSent(button_name) {
    return this.is_sents[button_name];
  };
  setMoving(button_name, is_moving) {
    this.is_movings[button_name] = is_moving;
  };
  getMoving(button_name) {
    return this.is_movings[button_name];
  };
  setPassedTime(button_name, passed_time) {
    this.passed_time[button_name] = passed_time;
  }
  getPassedTime(button_name) {
    return this.passed_time[button_name];
  }
  resetSent() {
    this.is_sents = { "120": false, "90": false, "60": false, "45": false, "180": false };
  }
  resetMoving() {
    this.is_movings = { "120": false, "90": false, "60": false, "45": false, "180": false };
  }
  ActivateAllSent() {
    this.is_sents = { "120": true, "90": true, "60": true, "45": true, "180": true };
  }
  ActivateAllMoving() {
    this.is_movings = { "120": true, "90": true, "60": true, "45": true, "180": true };
  }
  setIntervalAndTimeOut(interval, timeout) {
    this.interval = interval;
    this.timeout = timeout;
  }
  terminateIntervalAndTimeOut() {
    if (this.interval != null) {
      clearInterval(this.interval);
    }
    if (this.timeout != null) {
      this.timeout.forEach(timeout => {
        clearTimeout(timeout);
      });
    }
  }
}
let server_name = "Clocky"
let msgList = {
  'startTimer': "===ここで正解なら3点===",
  '1/3passedTimer': "===ここで正解なら2点===",
  '2/3passedTimer': "===ここで正解なら1点===",
  'buttonAlready': "ボタンは既に押されています。",
  'greetServer': server_name + " has woken up! Hello!",
  'sentAlready': "タイマーは既に送信されています。",
  '5secRemaining': "5秒前です！",
  'terminateTimer': "===終了===",
  'timerHasStarted': "タイマーを開始しました。",
  'abortTimer': "タイマーを停止しました。",
  'start60secPrepare': "スタート！\n隠す場所を左,中央,右から選んでください！",
  '30secRemainingPrepare': "残り30秒！",
  '10secRemainingPrepare': "残り10秒！",
  '0secRemainingPrepare': "終了です！\n続いて、「解答フェーズ」です！\n進行からの指示があるまでこのままお待ちください。",
  'left': "左を選択しました。",
  'middle': "中央を選択しました。",
  'right': "右を選択しました。",
  'lastAlready': "コマンド実行済みです。",
  'start180secLast': "制限時間は3分間です！",
  '120secRemainingLast': "残り2分",
  '90secRemainingLast': "残り1分30秒",
  '60secRemainingLast': "残り1分",
  '30secRemainingLast': "残り30秒。\n解答の修正は制限時間内にお願いします。\nどうしてもわからない場合は「わからない」と送信してください",
  '10secRemainingLast': "残り10秒",
  '0secRemainingLast': "終了"
}


const button_120 = new MessageButton()
  .setCustomId('120')
  .setLabel('120秒タイマースタート')
  .setStyle('SUCCESS')
  .setEmoji('⚪');
const button_90 = new MessageButton()
  .setCustomId('90')
  .setLabel('90秒タイマースタート')
  .setStyle('SUCCESS')
  .setEmoji('🟡');
const button_60 = new MessageButton()
  .setCustomId('60')
  .setLabel('60秒タイマースタート')
  .setStyle('SUCCESS')
  .setEmoji('🟠');
const button_45 = new MessageButton()
  .setCustomId('45')
  .setLabel('45秒タイマースタート')
  .setStyle('SUCCESS')
  .setEmoji('🔴');
const button_left = new MessageButton()
  .setCustomId('left')
  .setLabel('左')
  .setStyle('PRIMARY')
const button_middle = new MessageButton()
  .setCustomId('middle')
  .setLabel('中央')
  .setStyle('PRIMARY')
const button_right = new MessageButton()
  .setCustomId('right')
  .setLabel('右')
  .setStyle('PRIMARY')
const button_last_hint = new MessageButton()
  .setCustomId('last_hint')
  .setLabel('ヒント')
  .setStyle('PRIMARY')
let buttons = {
  "120": button_120,
  "90": button_90,
  "60": button_60,
  "45": button_45,
  "left": button_left,
  "middle": button_middle,
  "right": button_right
};
let num_of_questions = 6;
let temp_iter = ["45", "90"];
for (let i = 0; i < num_of_questions; i++) {
  buttons["a" + i + "_obst"] = new MessageButton()
    .setCustomId("a" + i + "_obst")
    .setLabel("妨害開始")
    .setStyle('DANGER')
  // .setEmoji('🔴');
  temp_iter.forEach(sec_val => {
    dirIter.forEach(dir_val => {
      buttons[sec_val + "_a_" + i + "_" + dir_val] = new MessageButton()
        .setCustomId(sec_val + "_a_" + i + "_" + dir_val)
        .setLabel("解答開始")
        .setStyle('SUCCESS')
      // .setEmoji('🔴');
      buttons[sec_val + "_b_" + i + "_" + dir_val] = new MessageButton()
        .setCustomId(sec_val + "_b_" + i + "_" + dir_val)
        .setLabel("解答開始")
        .setStyle('SUCCESS')
    });
  });
};
let commands = [
  // {
  //   name: '45',
  //   description: '45秒のタイマーを送信します。'
  // },
  // {
  //   name: '60',
  //   description: '60秒のタイマーを送信します。'
  // },
  // {
  //   name: '90',
  //   description: '90秒のタイマーを送信します。'
  // },
  // {
  //   name: '120',
  //   description: '120秒のタイマーを送信します。'
  // },
  {
    name: 'staff_only',
    description: 'スタッフ用コマンドです。'
  },
  {
    name: 'stop',
    description: 'タイマーを停止します。'
  },
  // {
  //   name: 'left',
  //   description: '左を選択します。'
  // },
  // {
  //   name: 'middle',
  //   description: '中央を選択します。'
  // },
  // {
  //   name: 'right',
  //   description: '右を選択します。'
  // },
  {
    name: "answer",
    description: "解答フェイズを始めます。",
    options: [
      {
        type: "STRING",
        name: "question_num",
        description: "何問目ですか？",
        required: true,
        choices: [
          {
            name: "チュートリアル",
            value: "0"
          },
          {
            name: "1問目",
            value: "1"
          },
          {
            name: "2問目",
            value: "2"
          },
          {
            name: "3問目",
            value: "3"
          },
          {
            name: "4問目",
            value: "4"
          },
          {
            name: "5問目",
            value: "5"
          },
        ],
      },
      {
        type: "STRING",
        name: "mode",
        description: "どちらのモードですか？",
        required: true,
        choices: [
          {
            name: "A",
            value: "a"
          },
          {
            name: "B",
            value: "b"
          }
        ],
      },
      {
        type: "STRING",
        name: "dir",
        description: "どちらの方向ですか？",
        required: true,
        choices: [
          {
            name: "left",
            value: "left"
          },
          {
            name: "middle",
            value: "middle"
          },
          {
            name: "right",
            value: "right"
          }
        ],
      },
      {
        type: "STRING",
        name: "sec_val",
        description: "何秒ですか？",
        required: true,
        choices: [
          {
            name: "45",
            value: "45"
          },
          {
            name: "90",
            value: "90"
          }
        ]
      }
    ]
  },
  {
    name: "hide",
    description: "妨害フェイズを始めます。",
    options: [
      {
        type: "STRING",
        name: "mode",
        description: "どちらのモードですか？",
        required: true,
        choices: [
          {
            name: "A",
            value: "a"
          },
          {
            name: "B",
            value: "b"
          }
        ]
      },
      {
        type: "STRING",
        name: "question_num",
        description: "何問目ですか？",
        required: true,
        choices: [
          {
            name: "チュートリアル",
            value: "0"
          },
          {
            name: "1問目",
            value: "1"
          },
          {
            name: "2問目",
            value: "2"
          },
          {
            name: "3問目",
            value: "3"
          },
          {
            name: "4問目",
            value: "4"
          },
          {
            name: "5問目",
            value: "5"
          },
        ]
      }
    ]
  }
];
client.on("ready", (message) => {
  // スラッシュコマンドの登録
  client.application.commands.set(commands);
  console.log("Bot準備完了！");
});

//ここから

client.on("messageCreate", message => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  if (!(message.channel.id in statusList)) {
    statusList[message.channel.id] = new Status();
    // sendMsg(message.channel.id, msgList['greetServer']);
    statusList[message.channel.id].setStatus('activated');
  }
  if (statusList[message.channel.id].getStatus() == "disactivated") {
    return;
  }
  //check if the content includes one of the answers
  // if (valueExists(message.content, answers)) {
  //   if (statusList[message.channel.id].getSent(findKeyByValue(message.content, answers))) {
  //     sendMsg(message.channel.id, msgList['sentAlready']);
  //     return;
  //   }
  //   else {
  //     // statusList[message.channel.id].setSent(findKeyByValue(message.content, answers), true);
  //     sendButton(message.channel.id, findKeyByValue(message.content, answers));
  //     return;
  //   }
  // }

  if (message.content == "stop") {
    statusList[message.channel.id].setStatus('disactivated');
    statusList[message.channel.id].resetSent();
    statusList[message.channel.id].resetMoving();
    statusList[message.channel.id].terminateIntervalAndTimeOut();
    sendMsg(message.channel.id, msgList['abortTimer']);
  }
  else {
    // sendMsg(message.channel.id, "コマンドが間違っています。");
  }
});
//ここまで


async function sendImg(channel_id, img_name, send_dir_buttons = true, send_msg = "") {
  let send_image_url = "https://cdn.glitch.global/127e421d-34d2-438f-906c-d1dfaae6ee13/" + img_name;
  if (send_dir_buttons) {
    await client.channels.cache.get(channel_id).send({
      files: [send_image_url],
      components: [
        new MessageActionRow().addComponents(
          buttons['left'],
          buttons['middle'],
          buttons['right']
        )
      ]
    });
  }
  else {
    await client.channels.cache.get(channel_id).send({
      files: [send_image_url]
    });
  }
  statusList[channel_id].setStatus('img_sent');
  console.log(channel_id + "に画像" + img_name + "を送信しました。");
}
async function onInteraction(interaction) {
  const member = await interaction.member.fetch();
  const interaction_channel = interaction.channelId;
  if (!(interaction_channel in statusList)) {
    statusList[interaction_channel] = new Status();
    statusList[interaction_channel].setStatus('activated');
  }
  if (interaction.isButton()) {
    if (statusList[interaction_channel].getStatus() == "disactivated") {
      return;
    }
    if (interaction.customId == 'left' || interaction.customId == 'middle' || interaction.customId == 'right') {
      interaction.reply({ content: msgList[interaction.customId], ephemeral: false });
    }
    for (let i = 0; i < num_of_questions; i++) {
      if (interaction.customId == "a" + i + "_obst" || interaction.customId == "b" + i + "_obst") {
        let mode = interaction.customId[0];
        let sec_val = "60";
        console.log("secsIter for each: " + sec_val);
        // debug end
        if (statusList[interaction_channel].getMoving(sec_val)) {
          interaction.reply({ content: msgList['buttonAlready'], ephemeral: true });
          return;
        }
        statusList[interaction_channel].setMoving(sec_val, true);
        statusList[interaction_channel].setPassedTime(sec_val, 0);
        // debug start
        console.log("the button clicked: " + sec_val);
        // debug end
        if (statusList[interaction_channel] === "disactivated") {
          console.log("the button has been terminated because the status is disactivated: " + sec_val);
          return;
        }
        if (!statusList[interaction_channel].getMoving(sec_val)) {
          console.log("the button has been terminated because the status is not moving: " + sec_val);
          return;
        }
        await sendImg(interaction_channel, mode + i + ".png");
        const remain30sec = setTimeout(() => {
          if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
            return;
          }
          sendMsg(interaction_channel, msgList['30secRemainingPrepare']);
        }, 1000 * (30));
        const remain10sec = setTimeout(() => {
          if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
            return;
          }
          sendMsg(interaction_channel, msgList['10secRemainingPrepare']);
        }, 1000 * (50));
        const remain0sec = setTimeout(() => {
          if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
            return;
          }
          sendMsg(interaction_channel, msgList['0secRemainingPrepare']);
          statusList[interaction_channel].setMoving(sec_val, false);
          statusList[interaction_channel].passed_time[sec_val] = 0;
        }, 1000 * (60));
        statusList[interaction_channel].setIntervalAndTimeOut(null, [remain30sec, remain10sec, remain0sec]);
        // debug start
        console.log("the button clicked: " + sec_val);
        // debug end
        await interaction.reply({ content: msgList['start60secPrepare'], ephemeral: false });
        return;
      }

    }
    secsIter.forEach(sec_val => {
      // debug start
      console.log("secsIter for each: " + sec_val);
      // debug end
      if (interaction.customId == sec_val) {
        if (statusList[interaction_channel].getMoving(sec_val)) {
          interaction.reply({ content: msgList['buttonAlready'], ephemeral: true });
          return;
        } else {
          statusList[interaction_channel].setMoving(sec_val, true);
          statusList[interaction_channel].setPassedTime(sec_val, 0);
          // debug start
          console.log("the button clicked: " + sec_val);
          // debug end
          if (statusList[interaction_channel] === "disactivated") {
            console.log("the button has been terminated because the status is disactivated: " + sec_val);
            return;
          }
          if (!statusList[interaction_channel].getMoving(sec_val)) {
            console.log("the button has been terminated because the status is not moving: " + sec_val);
            return;
          }
          if (interaction.customId == '60') {
            const remain30sec = setTimeout(() => {
              if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
                return;
              }
              sendMsg(interaction_channel, msgList['30secRemainingPrepare']);
            }, 1000 * (30));
            const remain10sec = setTimeout(() => {
              if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
                return;
              }
              sendMsg(interaction_channel, msgList['10secRemainingPrepare']);
            }, 1000 * (50));
            const remain0sec = setTimeout(() => {
              if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
                return;
              }
              sendMsg(interaction_channel, msgList['0secRemainingPrepare']);
              statusList[interaction_channel].setMoving(sec_val, false);
              statusList[interaction_channel].passed_time[sec_val] = 0;
            }, 1000 * (60));
            statusList[interaction_channel].setIntervalAndTimeOut(null, [remain30sec, remain10sec, remain0sec]);
            // debug start
            console.log("the button clicked: " + sec_val);
            // debug end
            interaction.reply({ content: msgList['start60secPrepare'], ephemeral: false });
            return;
          }
          else {
            const testinterval = setInterval(function () {
              // debug start
              console.log("testinterval has set: " + sec_val);
              // debug end
              if (statusList[interaction_channel].passed_time[sec_val] == sec_val / 3) {
                // write me
                statusList[interaction_channel].passed_time[sec_val] = sec_val / 3 * 2;
                sendMsg(interaction_channel, msgList['1/3passedTimer']);
                // debug start
                console.log("the button clicked: " + sec_val);
                // debug end
              }
              else if (statusList[interaction_channel].passed_time[sec_val] == sec_val / 3 * 2) {
                statusList[interaction_channel].passed_time[sec_val] = sec_val;
                sendMsg(interaction_channel, msgList['2/3passedTimer']);
                // debug start
                console.log("the button clicked: " + sec_val);
                // debug end
              }
              else if (statusList[interaction_channel].passed_time[sec_val] >= sec_val) {
                clearInterval(testinterval);
                sendMsg(interaction_channel, msgList['terminateTimer']);
                // sendButton(interaction_channel, sec_val);
                statusList[interaction_channel].setMoving(sec_val, false);
                statusList[interaction_channel].passed_time[sec_val] = 0;
                // debug start
                console.log("the button has been terminated: " + sec_val);
                // debug end
              }
            }, 1000 * sec_val / 3);
            const remain5sec = setTimeout(() => {
              if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
                return;
              }
              sendMsg(interaction_channel, msgList['5secRemaining']);
            }, 1000 * (sec_val - 5));
            statusList[interaction_channel].setIntervalAndTimeOut(testinterval, [remain5sec]);
            statusList[interaction_channel].setPassedTime(sec_val, sec_val / 3);
            // debug start
            console.log("the button clicked: " + sec_val);
            // debug end
            interaction.reply({ content: msgList['startTimer'], ephemeral: false });
            return;
          }
        }
      }
    });
    for (let dir_val of dirIter) {
      for (let sec_val of secsIter) {
        for (let i = 0; i < num_of_questions; i++) {
          if (interaction.customId == sec_val + "_a_" + i + "_" + dir_val || interaction.customId == sec_val + "_b_" + i + "_" + dir_val) {
            let sec_val = interaction.customId.split("_")[0];
            let mode = interaction.customId.split("_")[1];
            let question_num = interaction.customId.split("_")[2];
            let dir_val = interaction.customId.split("_")[3];
            console.log("here you come!!, " + sec_val + " " + mode + " " + question_num + " " + dir_val);
            if (statusList[interaction_channel].getMoving(sec_val)) {
              interaction.reply({ content: msgList['buttonAlready'], ephemeral: true });
              return;
            } else {
              statusList[interaction_channel].setMoving(sec_val, true);
              statusList[interaction_channel].setPassedTime(sec_val, 0);
              // debug start
              console.log("the button clicked: " + sec_val);
              // debug end
              if (statusList[interaction_channel] === "disactivated") {
                console.log("the button has been terminated because the status is disactivated: " + sec_val);
                return;
              }
              if (!statusList[interaction_channel].getMoving(sec_val)) {
                console.log("the button has been terminated because the status is not moving: " + sec_val);
                return;
              }
              const testinterval = setInterval(function () {
                // debug start
                console.log("testinterval has set: " + sec_val);
                // debug end
                if (statusList[interaction_channel].passed_time[sec_val] == sec_val / 3) {
                  // write me
                  statusList[interaction_channel].passed_time[sec_val] = sec_val / 3 * 2;
                  sendMsg(interaction_channel, msgList['1/3passedTimer']);
                  // debug start
                  console.log("the button clicked: " + sec_val);
                  // debug end
                }
                else if (statusList[interaction_channel].passed_time[sec_val] == sec_val / 3 * 2) {
                  statusList[interaction_channel].passed_time[sec_val] = sec_val;
                  sendMsg(interaction_channel, msgList['2/3passedTimer']);
                  // debug start
                  console.log("the button clicked: " + sec_val);
                  // debug end
                }
                else if (statusList[interaction_channel].passed_time[sec_val] >= sec_val) {
                  clearInterval(testinterval);
                  sendMsg(interaction_channel, msgList['terminateTimer']);
                  // sendButton(interaction_channel, sec_val);
                  statusList[interaction_channel].setMoving(sec_val, false);
                  statusList[interaction_channel].passed_time[sec_val] = 0;
                  // debug start
                  console.log("the button has been terminated: " + sec_val);
                  // debug end
                }
              }, 1000 * sec_val / 3);
              const remain5sec = setTimeout(() => {
                if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
                  return;
                }
                sendMsg(interaction_channel, msgList['5secRemaining']);
              }, 1000 * (sec_val - 5));
              statusList[interaction_channel].setIntervalAndTimeOut(testinterval, [remain5sec]);
              statusList[interaction_channel].setPassedTime(sec_val, sec_val / 3);
              // debug start
              console.log("the button clicked: " + sec_val);
              // debug end
              await sendImg(interaction_channel, "" + mode + question_num + "_" + dir_val + ".png");
              await interaction.reply({ content: msgList['startTimer'], ephemeral: false });
              return;
            }
          }
        }
      };
    };
  }
  else if (interaction.isCommand()) {
    if (interaction.commandName == "staff_only") {
      let sec_val = "180";
      console.log("final section");
      if (statusList[interaction_channel].getMoving(sec_val)) {
        interaction.reply({ content: msgList['lastAlready'], ephemeral: true });
        return;
      }
      statusList[interaction_channel].setMoving(sec_val, true);
      statusList[interaction_channel].setPassedTime(sec_val, 0);
      if (statusList[interaction_channel] === "disactivated") {
        console.log("the button has been terminated because the status is disactivated: " + sec_val);
        return;
      }
      if (!statusList[interaction_channel].getMoving(sec_val)) {
        console.log("the button has been terminated because the status is not moving: " + sec_val);
        return;
      }
      const remain120sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['120secRemainingLast']);
      }, 1000 * (60));
      const remain90sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['90secRemainingLast']);
      }, 1000 * (60 + 30));
      const remain60sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['60secRemainingLast']);
      }, 1000 * (60 + 60));
      const remain30sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['30secRemainingLast']);
      }, 1000 * (60 + 60 + 30));
      const remain10sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['10secRemainingLast']);
      }, 1000 * (60 + 60 + 30 + 20));
      const remain0sec = setTimeout(() => {
        if (statusList[interaction_channel] === "disactivated" || !statusList[interaction_channel].getMoving(sec_val)) {
          return;
        }
        sendMsg(interaction_channel, msgList['0secRemainingLast']);
        statusList[interaction_channel].setMoving(sec_val, false);
        statusList[interaction_channel].passed_time[sec_val] = 0;
      }, 1000 * (180));
      statusList[interaction_channel].setIntervalAndTimeOut(null, [remain120sec, remain90sec, remain60sec, remain30sec, remain10sec, remain0sec]);
      await interaction.reply({ content: msgList['start180secLast'], ephemeral: true });
      return;
    }
    if (interaction.commandName == "hide") {
      let mode = interaction.options.getString("mode");
      let question_num = interaction.options.getString("question_num");
      interaction.reply({
        components: [
          new MessageActionRow().addComponents(buttons[mode + question_num + "_obst"])], ephemeral: false
      });
      return;
    }
    secsIter.forEach(sec_val => {
      if (interaction.commandName == sec_val) {
        interaction.reply({
          components: [
            new MessageActionRow().addComponents(buttons[sec_val])], ephemeral: false
        });
        return;
      }
    });
    if (interaction.commandName == "answer") {
      let mode = interaction.options.getString("mode");
      let question_num = interaction.options.getString("question_num");
      let dir_val = interaction.options.getString("dir");
      let sec_val = interaction.options.getString("sec_val");
      interaction.reply({
        components: [
          new MessageActionRow().addComponents(buttons[sec_val + "_" + mode + "_" + question_num + "_" + dir_val])], ephemeral: false
      });
      return;
    }
    if (interaction.commandName == "stop") {
      statusList[interaction_channel].resetSent();
      statusList[interaction_channel].resetMoving();
      statusList[interaction_channel].terminateIntervalAndTimeOut();
      interaction.reply({ content: msgList['abortTimer'], ephemeral: false });
    }
    else {
      interaction.reply({ content: "未知のコマンド。", ephemeral: true });
    }
  }
}
client.once("ready", () => {
  console.log("Logged in as " + client.user.tag);
  client.on("interactionCreate", (interaction) => onInteraction(interaction).catch(err => console.log(err)));
});

client.login(process.env.DISCORD_BOT_TOKEN);

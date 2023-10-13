const { Client } = require("discord.js");
const options = { intents: ["GUILDS", "GUILD_MESSAGES"] };
const client = new Client(options);
const secsIter = ['120', '90', '60', '45'];
let statusList = {};
function sendMsg(channelId, text, option = {}) {
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

class Status {
  constructor() {
    this.status = "init";
    this.is_sents = { "120": false, "90": false, "60": false, "45": false };
    this.is_movings = { "120": false, "90": false, "60": false, "45": false };
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
  resetSent() {
    this.is_sents = { "120": false, "90": false, "60": false, "45": false };
  }
  resetMoving() {
    this.is_movings = { "120": false, "90": false, "60": false, "45": false };
  }
}
let server_name = "clocky bot"
let msgList = {
  'startTimer': "===ここで正解なら3点===",
  '1/3passedTimer': "===ここで正解なら2点===",
  '2/3passedTimer': "===ここで正解なら1点===",
  'greetServer': server_name + " has joined the server!! Hello!!",
  'buttonAlready': "このボタンは既に押されています。",
  'sentAlready': "タイマーは既に送信されています。",
  '5secRemaining': "5秒前です。",
  'terminateTimer': "====終了===="
}

const button_120 = new Discord.MessageButton()
  .setCustomId('120')
  .setLabel('120sec')
  .setStyle('PRIMARY')
  .setEmoji('⏰');
const button_90 = new Discord.MessageButton()
  .setCustomId('90')
  .setLabel('90sec')
  .setStyle('SECONDARY')
  .setEmoji('⏰');
const button_60 = new Discord.MessageButton()
  .setCustomId('60')
  .setLabel('60sec')
  .setStyle('SUCCESS')
  .setEmoji('⏰');
const button_45 = new Discord.MessageButton()
  .setCustomId('45')
  .setLabel('45sec')
  .setStyle('DANGER')
  .setEmoji('⏰');
const buttons = { "120": button_120, "90": button_90, "60": button_60, "45": button_45 };
const answers = { "120": "120", "90": "90", "60": "60", "45": "45" };
client.on("ready", (message) => {
  console.log("Bot準備完了！");
});

//ここから

client.on("messageCreate", message => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  else if (!(message.channel.id in statusList) || statusList[message.channel.id].status == 'disactivated') {
    if (!(message.channel.id in statusList)) {
      statusList[message.channel.id] = new Status();
      sendMsg(message.channel.id, msgList['greetServer']);
    }
    statusList[message.channel.id].setStatus('activated');
    return;
  }
  //check if the content includes one of the answers
  else if (valueExists(message.content, answers)) {
    if (statusList[message.channel.id].getSent(findKeyByValue(message.content, answers))) {
      sendMsg(message.channel.id, msgList['sentAlready']);
      return;
    }
    else {
      statusList[message.channel.id].setSent(findKeyByValue(message.content, answers), true);
      sendButton(message.channel.id, findKeyByValue(message.content, answers));
      return;
    }
  }
  else if (message.content == "stop") {
    // write me
  }
  else {
    sendMsg(message.channel.id, "コマンドが間違っています。");
  }
})

//ここまで


function sendButton(channel_id, button_name) {
  client.channels.get(channel_id).send({
    content: '',
    components: [
      new Discord.MessageActionRow().addComponents(buttons[button_name])
    ]
  });
  statusList[channel_id].setStatus('buttons_sent');
  console.log(channel_id + "にボタンを送信しました。");
}

async function onInteraction(interaction) {
  const member = await interaction.member.fetch();
  secsIter.forEach(sec_val => {
    if (interaction.customId === secsIter[sec_val]) {
      if (statusList[interaction.channelId].getMoving(sec_val)) {
        interaction.reply({ content: msgList['buttonAlready'], ephemeral: true });
        return;
      } else {
        statusList[interaction.channelId].setMoving(sec_val, true);
        statusList[interaction.channelId].passed_time[sec_val] = 0;
        const testinterval = setInterval(function () {
          if (statusList[interaction.channelId] === "disactivated") {
            clearInterval(testinterval);
          } else if (!statusList[interaction.channelId].getMoving(sec_val)) {
            clearInterval(testinterval);
          } else {
            if (statusList[interaction.channelId].passed_time[sec_val] == 0) {
              statusList[interaction.channelId].passed_time[sec_val] = sec_val / 3;
              sendMsg(interaction.channelId, msgList['startTimer']);
            }
            else if (statusList[interaction.channelId].passed_time[sec_val] == sec_val / 3) {
              // write me
              statusList[interaction.channelId].passed_time[sec_val] = sec_val / 3 * 2;
              sendMsg(interaction.channelId, msgList['1/3passedTimer']);
            }
            else if (statusList[interaction.channelId].passed_time[sec_val] == sec_val / 3 * 2) {
              // write me
              statusList[interaction.channelId].passed_time[sec_val] = sec_val;
              sendMsg(interaction.channelId, msgList['2/3passedTimer']);
            }
            else if (statusList[interaction.channelId].passed_time[sec_val] >= sec_val) {
              clearInterval(testinterval);
              sendMsg(interaction.channelId, msgList['terminateTimer']);
              statusList[interaction.channelId].setMoving(sec_val, false);
              statusList[interaction.channelId].passed_time[sec_val] = 0;
            }
          }
        }, 1000 * sec_val / 3);
        const remain5sec = setTimeout(() => {
          if (statusList[interaction.channelId] === "disactivated" || !statusList[interaction.channelId].getMoving(sec_val)) {
            return;
          }
          sendMsg(interaction.channelId, msgList['5secRemaining']);
        }, 1000 * (sec_val - 5));
      }
    }
  });
}

client.once("ready", () => {
  console.log("Logged in as " + client.user.tag);
  client.on("interactionCreate", (interaction) => onInteraction(interaction).catch(err => console.log(err)));
});

client.login(process.env.DISCORD_BOT_TOKEN);

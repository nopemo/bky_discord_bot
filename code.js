const { ButtonBuilder, ButtonStyle, Client, MessageButton, MessageActionRow } = require("discord.js");
const options = { intents: ["GUILDS", "GUILD_MESSAGES"] };
const client = new Client(options);
const secsIter = ['120', '90', '60', '45'];
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
  setPassedTime(button_name, passed_time) {
    this.passed_time[button_name] = passed_time;
  }
  getPassedTime(button_name) {
    return this.passed_time[button_name];
  }
  resetSent() {
    this.is_sents = { "120": false, "90": false, "60": false, "45": false };
  }
  resetMoving() {
    this.is_movings = { "120": false, "90": false, "60": false, "45": false };
  }
  ActivateAllSent() {
    this.is_sents = { "120": true, "90": true, "60": true, "45": true };
  }
  ActivateAllMoving() {
    this.is_movings = { "120": true, "90": true, "60": true, "45": true };
  }
  setIntervalAndTimeOut(interval, timeout) {
    this.interval = interval;
    this.timeout = timeout;
  }
  terminateIntervalAndTimeOut() {
    if (this.interval == null || this.timeout == null) {
      return;
    }
    clearInterval(this.interval);
    clearTimeout(this.timeout);
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
  '5secRemaining': "5秒前です。",
  'terminateTimer': "====終了====",
  'timerHasStarted': "タイマーを開始しました。",
  'abortTimer': "タイマーを停止しました。"
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
const buttons = { "120": button_120, "90": button_90, "60": button_60, "45": button_45 };
const answers = { "120": "120", "90": "90", "60": "60", "45": "45" };
client.on("ready", (message) => {
  // スラッシュコマンドの登録
  client.application.commands.set([
    {
      name: '45',
      description: '45秒のタイマーを送信します。'
    },
    {
      name: '60',
      description: '60秒のタイマーを送信します。'
    },
    {
      name: '90',
      description: '90秒のタイマーを送信します。'
    },
    {
      name: '120',
      description: '120秒のタイマーを送信します。'
    },
    {
      name: 'stop',
      description: 'タイマーを停止します。'
    }
  ]);
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
  if (valueExists(message.content, answers)) {
    if (statusList[message.channel.id].getSent(findKeyByValue(message.content, answers))) {
      sendMsg(message.channel.id, msgList['sentAlready']);
      return;
    }
    else {
      // statusList[message.channel.id].setSent(findKeyByValue(message.content, answers), true);
      sendButton(message.channel.id, findKeyByValue(message.content, answers));
      return;
    }
  }
  else if (message.content == "stop") {
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


function sendButton(channel_id, button_name) {
  client.channels.cache.get(channel_id).send({
    // content: 'a',
    components: [
      new MessageActionRow().addComponents(buttons[button_name])
    ]
  });
  statusList[channel_id].setStatus('buttons_sent');
  console.log(channel_id + "にボタンを送信しました。");
}
async function onInteraction(interaction) {
  const member = await interaction.member.fetch();
  const interaction_channel = interaction.channelId;
  if (!(interaction_channel in statusList)) {
    statusList[interaction_channel] = new Status();
    statusList[interaction_channel].setStatus('activated');
  }
  if (interaction.isButton()) {
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
          statusList[interaction_channel].setIntervalAndTimeOut(testinterval, remain5sec);
          statusList[interaction_channel].setPassedTime(sec_val, sec_val / 3);
          // debug start
          console.log("the button clicked: " + sec_val);
          // debug end
          interaction.reply({ content: msgList['startTimer'], ephemeral: false });
          return;
        }
      }
    });
  }
  else if (interaction.isCommand()) {
    secsIter.forEach(sec_val => {
      if (interaction.commandName == sec_val) {
        interaction.reply({
          components: [
            new MessageActionRow().addComponents(buttons[sec_val])], ephemeral: false
        });
        return;
      }
    });
    if (interaction.commandName == "stop") {
      statusList[interaction_channel].resetSent();
      statusList[interaction_channel].resetMoving();
      statusList[interaction_channel].terminateIntervalAndTimeOut();
      interaction.reply({ content: msgList['abortTimer'], ephemeral: false });
    }
  }
}
client.once("ready", () => {
  console.log("Logged in as " + client.user.tag);
  client.on("interactionCreate", (interaction) => onInteraction(interaction).catch(err => console.log(err)));
});

client.login(process.env.DISCORD_BOT_TOKEN);

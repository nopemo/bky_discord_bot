const { channel } = require("diagnostics_channel");
const { Client, GatewayIntentBits } = require("discord.js");
const { send } = require("process");
let statusList = {};
class Status {
  constructor() {
    this.status = "init";
    this.num_of_players = 0;
    this.player_status = new Array();
  }
  setStatus(status) {
    this.status = status;
  }
  getStatus() {
    return this.status;
  }
  addPlayer(player_id) {
    //player_id, status, start_time
    this.player_status.push([player_id, "stopped", 0]);
    this.num_of_players++;
  }
  deletePlayer(player_id) {
    this.player_status.splice(this.player_status.indexOf(player_id), 1);
    this.num_of_players--;
  }
  startTimer(player_id) {
    if (!this.player_status.includes(player_id))
      addPlayer(player_id);
    if (this.player_status[this.player_status.indexOf(player_id)][1] != "started")
      return;
    if (this.player_status[this.player_status.indexOf(player_id)][1] == "paused")
      this.player_status[this.player_status.indexOf(player_id)][2] = Date.now() - this.player_status[this.player_status.indexOf(player_id)][2];
    if (this.player_status[this.player_status.indexOf(player_id)][1] == "stopped")
      this.player_status[this.player_status.indexOf(player_id)][2] = Date.now();
    this.player_status[this.player_status.indexOf(player_id)][1] = "started";
  }
  pauseTimer(player_id) {
    if (!this.player_status.includes(player_id))
      addPlayer(player_id);
    if (this.player_status[this.player_status.indexOf(player_id)][1] != "stopped")
      return;
    if (this.player_status[this.player_status.indexOf(player_id)][1] == "paused")
      return;
    this.player_status[this.player_status.indexOf(player_id)][1] = "paused";
    this.player_status[this.player_status.indexOf(player_id)][2] = Date.now() - this.player_status[this.player_status.indexOf(player_id)][2];
  }
  stopTimer(player_id) {
    if (!this.player_status.includes(player_id))
      addPlayer(player_id);
    this.player_status[this.player_status.indexOf(player_id)][1] = "stopped";
    this.player_status[this.player_status.indexOf(player_id)][2] = 0;
  }
};
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
let server_name = "clocky bot"
let msgList = {
  'startTimer': "タイマーをスタートします。",
  'greetServer': server_name + " has joined the server!! Hello!!",
}

const button_start = new Discord.MessageButton()
  .setCustomId('startTimer')
  .setLabel('タイマースタート')
  .setStyle('PRIMARY')
  .setEmoji('⏰');
const button_stop = new Discord.MessageButton()
  .setCustomId('stopTimer')
  .setLabel('タイマーストップ')
  .setStyle('SECONDARY')
  .setEmoji('⏰');

client.on("ready", () => {
  console.log("Bot準備完了！");
});

//ここから

client.on("messageCreate", message => {
  if (message.author.id == client.user.id || message.author.bot) {
    return;
  }
  else if (!(message.channel.id in statusList) || statusList[message.channel.id][0] == 'disactivated') {
    if (!(message.channel.id in statusList)) {
      statusList[message.channel.id] = new Status();
      sendMsg(message.channel.id, msgList['greetServer']);
    }
    statusList[message.channel.id].setStatus('init');
    sendButtons(message.channel.id);
    return;
  }
})

//ここまで


function sendButtons(channel_id) {
  client.channels.get(channel_id).send({
    content: '',
    components: [
      new Discord.MessageActionRow().addComponents(button_start),
      new Discord.MessageActionRow().addComponents(button_stop)
    ]
  });
  statusList[channel_id].setStatus('buttons_sent');
  console.log(channel_id + "にボタンを送信しました。");
}

async function onInteraction(interaction) {
  const member = await interaction.member.fetch();
  if (interaction.customId === 'startTimer') {
    statusList[interaction.channelId].addPlayer(member.id);
    statusList[interaction.channelId].startTimer(member.id);
    statusList[interaction.channelId].setStatus('timers_started');
  }
  else if (interaction.customId === 'stopTimer') {
    statusList[interaction.channelId].setStatus('timers_stopped');
    statusList[interaction.channelId].stopTimer(member.id);
    statusList[interaction.channelId].deletePlayer(member.id);
  }
  client.once("ready", () => {
    console.log("Logged in as " + client.user.tag);
    client.on("interactionCreate", (interaction) => onInteraction(interaction).catch(err => console.log(err)));
  });

  client.login(process.env.DISCORD_BOT_TOKEN);

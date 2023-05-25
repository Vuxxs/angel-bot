import {
  ApplicationCommandOptionType,
  ChannelType,
  CommandInteraction,
  GuildMember,
  Message,
} from "discord.js";
import { Command } from "../interfaces/command.interface";
import { sendMessage } from "../utilities/sendMessage";

export default {
  name: "purge",
  description: "Delete a certain number of messages in a channel",
  permissions: ["ManageMessages"],
  options: [
    {
      name: "amount",
      type: ApplicationCommandOptionType.Integer,
      description: "Number of messages to delete",
      required: true,
    },
  ],
  async execute(
    interaction?: CommandInteraction,
    message?: Message,
    args?: string[]
  ) {
    if (!args) args = [];
    const member = interaction?.member || message?.member;
    if (!(member instanceof GuildMember)) return; // Interaction is in DM, return
    if (!member.permissions.has("ManageMessages")) {
      sendMessage(
        message,
        interaction,
        "You do not have the necessary permissions to use this command."
      );
      return;
    }

    const amount =
      (interaction?.options.get("amount")!.value as number) ||
      parseInt(args[0]);

    if (!amount) {
      sendMessage(message, interaction, {
        content: "Invalid number of messages to delete.",
      });

      return;
    }

    const channel = interaction?.channel || message?.channel;
    if (!channel) return;
    if (channel.type === ChannelType.DM) {
      sendMessage(
        message,
        interaction,
        "Command can only be used in text channels."
      );

      return;
    }
    try {
      await channel.bulkDelete(amount, true);
      const reply =
        (await interaction?.reply({
          content: `${amount} messages deleted.`,
          ephemeral: true,
        })) || (await message?.channel.send(`${amount} messages deleted.`));
      setTimeout(() => reply?.delete(), 5000); // delete the message after 5 seconds
    } catch (error) {
      sendMessage(
        message,
        interaction,
        "An error occurred while trying to delete messages"
      );
    }
  },
} as Command;

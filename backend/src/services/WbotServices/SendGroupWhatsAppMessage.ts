import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import { getWbot } from "../../libs/wbot";
import { initWbot } from "../../libs/wbot";

import { Client } from "whatsapp-web.js";

import formatBody from "../../helpers/Mustache";
import Contact from "../../models/Contact";

interface SimpleRequest {
  wppId: number;
  body: string;
  name: string;
  number: string;
}

const SendGroupWhatsAppMessage = async ({
  wppId,
  body,
  number,
  name
}: SimpleRequest): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;

  let contato:Contact;
  contato = new Contact;
  contato.number = number;
  contato.name = name;

  const whatsapp = await Whatsapp.findByPk(wppId);

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }


  const wbot = await getWbot(wppId);

  let chats = await wbot.getChats();


  console.log(chats.filter((chat) => chat.isGroup === true && chat.name === 'Grande Família'))

  try {
    const sentMessage = await wbot.sendMessage(
      `${contato.number}@${contato.isGroup ? "g" : "c"}.us`,
      formatBody(body, contato)
    );

    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendGroupWhatsAppMessage;

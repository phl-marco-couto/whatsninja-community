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

import formatBody from "../../helpers/Mustache";
import Contact from "../../models/Contact";

interface SimpleRequest {
  wppId: number;
  body: string;
  name: string;
  number: string;
}

const SendSimpleWhatsAppMessage = async ({
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

  const whatsapp = await Whatsapp.findByPk(id, {
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ],
    order: [["queues", "name", "ASC"]]
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }


  const wbot = initWbot(whatsapp);

  try {
    const sentMessage = await wbot.sendMessage(
      `${contato.number}@${contato.isGroup ? "g" : "c"}.us`,
      formatBody(body, contato),
      {
        quotedMessageId: quotedMsgSerializedId,
        linkPreview: false
      }
    );

    return sentMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendSimpleWhatsAppMessage;
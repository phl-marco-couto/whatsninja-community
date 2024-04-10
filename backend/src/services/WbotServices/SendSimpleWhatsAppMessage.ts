import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";
import Contact from "../../models/Contact";

interface SimpleRequest {
  body: string;
  name: string;
  number: string;
}

const SendSimpleWhatsAppMessage = async ({
  body,
  number,
  name
}: SimpleRequest): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;

  let contato:Contact;
  contato = {
    id: 0,
    number: number,
    email: '',
    profilePicUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    extraInfo: [],
    isGroup: false,
    tickets: [],
    name: name
  };

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

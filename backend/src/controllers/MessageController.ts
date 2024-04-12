import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import SendSimpleWhatsAppMessage from "../services/WbotServices/SendSimpleWhatsAppMessage";
import SendGroupWhatsAppMessage from "../services/WbotServices/SendGroupWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

type NumberMessageData = {
  number: string;
  name: string;
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ media, ticket });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  return res.send();
};

export const enviar = async (req: Request, res: Response): Promise<Response> => {
  const { wppIdParam } = req.params;
  const { number, name, body, quotedMsg }: NumberMessageData = req.body;
  console.log(req.params);
  let wppId;
  console.log(wppIdParam);
  wppId = Number(wppIdParam);

  await SendSimpleWhatsAppMessage({ wppId, body, number, name });

  return res.send();
};

export const enviarGrupo = async (req: Request, res: Response): Promise<Response> => {
  const { wppIdParam } = req.params;
  const { number, name, body, quotedMsg }: NumberMessageData = req.body;
  console.log(req.params);
  let wppId;
  console.log(wppIdParam);
  wppId = Number(wppIdParam);

  await SendGroupWhatsAppMessage({ wppId, body, number, name });

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};

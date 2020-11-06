import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from '@hctickets/common';
import { body } from 'express-validator';
import { TicketUpdatePublisher } from '../events/publisher/ticket-update-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').trim().notEmpty().withMessage('Need to pass in valid title'),
    body('price').isFloat({ gt: 0 }).withMessage('Need to pass a valid price'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket')
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.title = req.body.title;
    ticket.price = parseFloat(req.body.price);
    await ticket.save();

    await new TicketUpdatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };

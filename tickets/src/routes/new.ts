import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, requireAuth } from '@hctickets/common';
import { Ticket } from '../models/ticket';
import { TicketCreatePublisher } from '../events/publisher/ticket-create-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('need to provide a valid title'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('price must be greater than zero'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title: title,
      price: parseFloat(price),
      userId: currentUser.id,
    });
    await ticket.save();

    await new TicketCreatePublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });
    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

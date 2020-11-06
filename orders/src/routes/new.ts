import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@hctickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import {natsWrapper} from '../nats-wrapper'
import {OrderCreatedPublisher} from '../events/publisher/order-created-publisher'

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('ticketId is required..'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    //check ticket exist
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    //check ticket not bee reserved
    const bTest = await ticket.isReserved()
    if (bTest) {
      throw new BadRequestError('Ticket has been reserved');
    }

    let expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId: req.currentUser!.id,
      expiredAt: expiration,
      status: OrderStatus.Created,
      ticket: ticket,
    });
    await order.save();

    //publish an event said order created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      status: order.status,
      expiredAt: order.expiredAt.toISOString(),
      ticket:{
        id: order.ticket.id,
        price: order.ticket.price
      }
    }
    )

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };

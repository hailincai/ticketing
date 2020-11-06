import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@hctickets/common'
import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import { Order } from '../models/order'

const router = express.Router()

router.post('/api/payments', 
requireAuth,
[
  body('token')
    .not()
    .isEmpty(),
  body('orderId')
    .not()
    .isEmpty()
],
validateRequest,
async (req: Request, res: Response) => {
  const {token, orderId} = req.body
  
  const order = await Order.findById(orderId)
  if (!order){
    throw new NotFoundError()
  }
  if (order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }
  if (order.status !== OrderStatus.Created){
    throw new BadRequestError("order status wrong")
  }

  res.send({succ: true})
})

export {router as createChargeRoute}
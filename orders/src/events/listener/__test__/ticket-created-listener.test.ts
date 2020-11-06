import {TicketCreatedListener} from '../ticket-created-listener'
import {natsWrapper} from '../../../nats-wrapper'
import {TicketCreatedEvent} from '@hctickets/common'
import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {Ticket} from '../../../models/ticket'

const setup = async () => {
  //create listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  //create fake event data
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'test',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  //create fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg}
}

it('creates and saves a ticket', async() => {
  const {listener, data, msg} = await setup()

  await listener.onMessage(data, msg)

  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
  expect(ticket!.version).toEqual(0)
})

it('acks the msg', async () => {
  const {listener, data, msg} = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
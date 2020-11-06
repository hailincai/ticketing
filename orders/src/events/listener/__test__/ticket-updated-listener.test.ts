import mongoose from 'mongoose'
import {Ticket} from '../../../models/ticket'
import {TicketUpdatedEvent} from '@hctickets/common'
import {TicketUpdatedListener} from '../ticket-updated-listener'
import {natsWrapper} from '../../../nats-wrapper'
import {Message} from 'node-nats-streaming'

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)

  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 10
  })
  await ticket.save()

  //create the fake data
  const data:TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'test1',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  //build a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, ticket, data, msg}
}

it('finds, updates, and save a ticket', async() => {
  const {listener, ticket, data, msg} = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(data.id)
  expect(updatedTicket).toBeDefined()
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if skip version', async() => {
  const {listener, ticket, data, msg} = await setup()
  data.version += 1
  try{
    await listener.onMessage(data, msg)
  }catch(error) {
    expect(msg.ack).not.toHaveBeenCalled()
  }
})

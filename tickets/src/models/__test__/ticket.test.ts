import {Ticket} from '../ticket'

it('make sure concurrency control work', async (done) => {
  const ticket = Ticket.build({
    title: 'test',
    price: 5,
    userId: 'testusr'
  })
  await ticket.save()

  const firstInstance = await Ticket.findById(ticket.id)
  const secondIntance = await Ticket.findById(ticket.id)
  
  firstInstance!.set({price: 10})
  secondIntance!.set({price: 15})
  
  await firstInstance!.save()
  
  try{
    await secondIntance!.save()
  }catch(err){
    return done()
  }
  
  throw new Error('Should not be here')
})

it('make sure version change', async () => {
  const ticket = Ticket.build({
    title: 'test',
    price: 5,
    userId: 'user'
  })
  
  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})
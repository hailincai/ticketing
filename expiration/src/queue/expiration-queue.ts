import Queue from 'bull'
import {ExpirationCompletePublisher} from '../events/publisher/expiration-complete-publisher'
import {natsWrapper} from '../nats-wrapper'

interface Payload {
  orderId: string
}

const expirationQueue = new Queue<Payload>('expiration:queue', {
  redis:{
    host: process.env.REDIS_HOST
  }
})

expirationQueue.process(async (data) => {
  console.log("I try to publish a expiration:complete event for order:", data.data.orderId)
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: data.data.orderId
  })
  
})

export {expirationQueue}
import {Subjects, Publisher, OrderCreatedEvent} from '@hctickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  readonly subject = Subjects.ORDER_CREATED
}
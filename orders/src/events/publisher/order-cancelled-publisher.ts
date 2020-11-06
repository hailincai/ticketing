import {Subjects, Publisher, OrderCancelledEvent} from '@hctickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject = Subjects.ORDER_CANCELLED
}
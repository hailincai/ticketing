import {Subjects, Publisher, ExpirationCompleteEvent} from '@hctickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.EXPIRATION_COMPLETE
}
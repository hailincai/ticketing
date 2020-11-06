import mongoose from 'mongoose';
import {updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface TicketAttr {
  title: string;
  price: number;
  userId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttr): TicketDoc;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number,
  orderId?: string,
}

const TicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: {type: String, },
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

TicketSchema.set('versionKey', 'version')
TicketSchema.plugin(updateIfCurrentPlugin)

TicketSchema.statics.build = (attr: TicketAttr) => {
  return new Ticket(attr);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);

export { Ticket };

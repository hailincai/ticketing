import { OrderStatus } from "@hctickets/common";
import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'

interface OrderAttr {
  id: string,
  status: OrderStatus,
  version: number,
  userId: string,
  price: number
}

interface OrderDoc extends mongoose.Document {
  id: string,
  status: OrderStatus,
  version: number,
  userId: string,
  price: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attr: OrderAttr):OrderDoc
}

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus)
  },
  userId: {
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
    }
  }
})

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attr: OrderAttr) => {
  return new Order({_id: attr.id, status: attr.status, userId: attr.userId, price: attr.price, version: attr.version})
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order}
import { Product } from './product'

export type Action = 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'add_payment_info' | 'add_shipping_info' | 'purchase'

export interface ActionData {
  affiliation: string
  currency: string

  items: Product[]

  // For purchase action
  transactionId?: string
  shipping?: number
  tax?: number
  total?: number
  coupon?: string

  option?: string
}
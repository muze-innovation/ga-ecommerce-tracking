import { BaseProvider } from './_base'
import { Action, ActionData } from '../model/action'
import { Product } from '../model/product'

interface GA4Product {
  // Item ID (context-specific).
  item_id: string

  // Item Name (context-specific).
  item_name: string

  // Item quantity.
  quantity?: number

  // A product affiliation to designate a supplying company or brick and mortar store location.
  affiliation?: string

  // Coupon code used for a purchase.
  coupon?: string

  // Monetary value of discount associated with a purchase.
  discount?: number

  // Item brand
  item_brand?: string

  // Item Category (context-specific). item_category2 through item_category5 can also be used if the item has many categories.
  item_category?: string
  item_category_2?: string
  item_category_3?: string
  item_category_4?: string
  item_category_5?: string

  // The variant of the item.
  item_variant?: string

  // The monetary price of the item, in units of the specified currency parameter.
  price?: number

  // The currency, in 3-letter ISO 4217 format.
  currency?: string
}

interface GA4ProductAction {
  currency: string,
  items: GA4Product[]
  value: number
}

interface GA4BeginCheckoutAction {

  // Coupon code used for a purchase.
  coupon?: string

  // Currency of the purchase or items associated with the event, in 3-letter ISO 4217 format.
  currency?: string

  // The items for the event.
  items: GA4Product[]

  value: number
}

interface GA4PaymentInfoAction {

  // Coupon code used for a purchase.
  coupon?: string

  // Currency of the purchase or items associated with the event, in 3-letter ISO 4217 format.
  currency?: string

  // The items for the event.
  items: GA4Product[]

  payment_type: string

  value: number
}

export interface GA4ShippingInfoAction {

  // Coupon code used for a purchase.
  coupon?: string

  // Currency of the purchase or items associated with the event, in 3-letter ISO 4217 format.
  currency?: string

  // The items for the event.
  items: GA4Product[]

  shipping_tier: string

  value: number
}

export interface GA4PurchaseAction {
  // The unique identifier of a transaction.
  transaction_id: string

  // A product affiliation to designate a supplying company or brick and mortar store location.
  affiliation?: string

  // Coupon code used for a purchase.
  coupon?: string

  // Currency of the purchase or items associated with the event, in 3-letter ISO 4217 format.
  currency?: string

  // The items for the event.
  items: GA4Product[]

  // Tax cost associated with a transaction.
  tax: number

  // Shipping cost associated with a transaction.
  shipping: number

  // The monetary value of the event, in units of the specified currency parameter.
  value: number
}


export class GA4 implements BaseProvider {
  constructor(public readonly analyticId: string, public readonly currency: string, public debug: boolean) {}

  public send(action: Action, data: ActionData) {
    if (window.gtag !== undefined) {
      this.debug && console.log(
        'send (GA4)',
        action,
        data
      )
      switch (action) {
        case 'view_item':
          const productViewAction: GA4ProductAction = {
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            value: this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'view_item',
            productViewAction
          )
          window.gtag('event', 'view_item', productViewAction)
          return
        case 'add_to_cart':
          const addToCartAction: GA4ProductAction = {
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            value: this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'add_to_cart',
            addToCartAction
          )
          window.gtag('event', 'add_to_cart', addToCartAction)
          break
        case 'remove_from_cart':
          const removeFromCartAction: GA4ProductAction = {
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            value: this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'remove_from_cart',
            removeFromCartAction
          )
          window.gtag('event', 'remove_from_cart', removeFromCartAction)
          break
        case 'begin_checkout':
          const beginCheckoutAction: GA4BeginCheckoutAction = {
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            coupon: data.coupon,
            value: data.total || this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'begin_checkout',
            beginCheckoutAction
          )
          window.gtag('event', 'begin_checkout', beginCheckoutAction)
          break
        case 'add_payment_info':
          const paymentInfoAction: GA4PaymentInfoAction = {
            coupon: data.coupon,
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            payment_type: data.option || '',
            value: data.total || this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'add_payment_info',
            paymentInfoAction
          )
          window.gtag('event', 'add_payment_info', paymentInfoAction)
          break
        case 'add_shipping_info':
          const shippingInfoAction: GA4ShippingInfoAction = {
            coupon: data.coupon,
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            shipping_tier: data.option || '',
            value: data.total || this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'add_shipping_info',
            shippingInfoAction
          )
          window.gtag('event', 'add_shipping_info', shippingInfoAction)
          break
        case 'purchase':
          const purchaseAction: GA4PurchaseAction = {
            affiliation: data.affiliation || '',
            coupon: data.coupon,
            currency: this.currency,
            items: this.parseProduct(data.items, data.affiliation),
            transaction_id: data.transactionId || '',
            shipping: data.shipping || 0,
            tax: data.tax || 0,
            value: data.total || this.calculateProductTotal(data.items)
          }
          this.debug && console.log(
            'purchase',
            purchaseAction
          )
          window.gtag('event', 'purchase', purchaseAction)
          break
        default:
          return
      }
    }
  }

  protected parseProduct(products: Product[], affiliation: string = ''): GA4Product[] {
    return products.map((item) => ({
        affiliation,
        currency: this.currency,
        discount: item.discount || 0,
        item_brand: item.brand?.join(','),
        ...item.category?.reduce((itemCategory, cat, index) => {
          return {
            ...itemCategory,
            [index === 0 ? 'item_category' : `item_category_${index + 1}`]: cat
          }
        }, {}),
        item_id: item.id,
        item_name: item.name,
        item_variant: item.variant?.join('-'),
        price: item.price,
        quantity: item.quantity
    }))
  }


  protected calculateProductTotal(products: Product[]): number {
    return products.reduce((total, item) => {
        return total + (((item.price || 0) - (item.discount || 0)) * (item.quantity || 1))
    }, 0)
  }
}
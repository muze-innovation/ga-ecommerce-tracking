import { BaseProvider } from './_base';
import { Action, ActionData } from '../model/action';
import { Product } from '../model/product';

export interface UAProduct {
  // The product ID or SKU (e.g. P67890).
  id: string;

  // The name of the product (e.g. Android T-Shirt).
  name: string;

  // The brand associated with the product (e.g. Google).
  brand?: string;

  // The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
  category?: string;

  // The variant of the product (e.g. Black).
  variant?: string;

  // The price of a product (e.g. 29.20).
  price?: number;

  // The quantity of a product (e.g. 2).
  quantity?: number;

  // The coupon code associated with a product (e.g. SUMMER_SALE13).
  coupon?: string;
}

interface ProductAction {
  items: UAProduct[];
}

interface BeginCheckoutAction {
  // Coupon code used for a purchase.
  coupon: string;

  // The items for the event.
  items: UAProduct[];
}

interface CheckoutOptionAction {
  checkout_option: string;
}

interface UAPurchaseAction {
  // The transaction ID (e.g. T1234).
  transaction_id: string;

  // The store or affiliation from which this transaction occurred (e.g. Google Store).
  affiliation?: string;

  // Currency of the purchase or items associated with the event, in 3-letter ISO 4217 format.
  currency: string;

  // The items for the event.
  items: UAProduct[];

  // Specifies the total revenue or grand total associated with the transaction (e.g. 11.99).
  // This value may include shipping, tax costs, or other adjustments to total revenue that you want to include as part of your revenue calculations.
  value?: number;

  // The total tax associated with the transaction.
  tax?: number;

  // The shipping cost associated with the transaction.
  shipping?: number;

  // The transaction coupon redeemed with the transaction.
  coupon?: string;
}

export class UA implements BaseProvider {
  constructor(
    public readonly analyticId: string,
    public readonly currency: string,
    public debug: boolean
  ) {}

  public send(action: Action, data: ActionData) {
    if (window.gtag !== undefined) {
      this.debug && console.log('send (UA)', action, data);
      switch (action) {
        case 'view_item':
          const productViewAction: ProductAction = {
            items: this.parseProduct(data.items),
          };
          this.debug && console.log('view_item', productViewAction);
          window.gtag('event', 'view_item', productViewAction);
          break;
        case 'add_to_cart':
          const addToCartAction: ProductAction = {
            items: this.parseProduct(data.items),
          };
          this.debug && console.log('add_to_cart', addToCartAction);
          window.gtag('event', 'add_to_cart', addToCartAction);
          break;
        case 'remove_from_cart':
          const removeFromCartAction: ProductAction = {
            items: this.parseProduct(data.items),
          };
          this.debug && console.log('remove_from_cart', removeFromCartAction);
          window.gtag('event', 'remove_from_cart', removeFromCartAction);
          break;
        case 'begin_checkout':
          const beginCheckoutAction: BeginCheckoutAction = {
            items: this.parseProduct(data.items),
            coupon: data.coupon || '',
          };
          this.debug && console.log('begin_checkout', beginCheckoutAction);
          window.gtag('event', 'begin_checkout', beginCheckoutAction);
          break;
        case 'add_payment_info':
          const paymentInfoAction: CheckoutOptionAction = {
            checkout_option: data.option || '',
          };
          this.debug && console.log('set_checkout_option', paymentInfoAction);
          window.gtag('event', 'set_checkout_option', paymentInfoAction);
          break;
        case 'add_shipping_info':
          const shippingInfoAction: CheckoutOptionAction = {
            checkout_option: data.option || '',
          };
          this.debug && console.log('set_checkout_option', shippingInfoAction);
          window.gtag('event', 'set_checkout_option', shippingInfoAction);
          break;
        case 'purchase':
          const purchaseAction: UAPurchaseAction = {
            transaction_id: data.transactionId || '',
            affiliation: data.affiliation || '',
            currency: this.currency,
            value: data.total || 0,
            tax: data.tax || 0,
            shipping: data.shipping || 0,
            coupon: data.coupon || '',
            items: this.parseProduct(data.items),
          };
          this.debug && console.log('purchase', purchaseAction);
          window.gtag('event', 'purchase', purchaseAction);
          break;
        default:
          return;
      }
    }
  }

  protected parseProduct(products: Product[]): UAProduct[] {
    return products.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand?.join(','),
      category: item.category?.join(','),
      variant: item.variant?.join('-'),
      price: item.price,
      quantity: item.quantity,
    }));
  }
}

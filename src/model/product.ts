export interface Product {
  id: string

  name: string

  brand?: string[]

  // The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
  category?: string[]

  // The variant of the product (e.g. Black).
  variant?: string[]

  // The price of a product (e.g. 29.20).
  price?: number

  // The discount of a product (e.g. 29.20).
  discount?: number

  // The quantity of a product (e.g. 2).
  quantity?: number

  // The coupon code associated with a product (e.g. SUMMER_SALE13).
  coupon?: string
}
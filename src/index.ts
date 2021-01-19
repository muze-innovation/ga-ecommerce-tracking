import { Action, ActionData } from './model/action'
import { BaseProvider } from './provider/_base'
import { UA } from './provider/ua'
import { GA4 } from './provider/ga4'

declare global {
  interface Window {
    gtag: any
    ga: any
  }
  type ga = (action: any, data: any ) => any
}

class EcommerceGA {
  private readonly provider: BaseProvider | undefined

  constructor(public readonly analyticId: string, public readonly currency: string = 'THB', public readonly _debug: boolean = false) {
    if (analyticId.startsWith('UA')) {
      this.provider = new UA(analyticId, currency, _debug)
    } else {
      this.provider = new GA4(analyticId, currency, _debug)
    }
  }

  public send(action: Action, data: ActionData) {
    if (this.provider) {
      this.provider.send(action, data)
    }
  }
}

export default EcommerceGA
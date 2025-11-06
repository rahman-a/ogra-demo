import 'i18next'
import common from './locales/en/common.json'
import auth from './locales/en/auth.json'
import dashboard from './locales/en/dashboard.json'
import rides from './locales/en/rides.json'
import wallet from './locales/en/wallet.json'
import landing from './locales/en/landing.json'
import actions from './locales/en/actions.json'

interface I18nNamespaces {
  common: typeof common
  auth: typeof auth
  dashboard: typeof dashboard
  rides: typeof rides
  wallet: typeof wallet
  landing: typeof landing
  actions: typeof actions
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}


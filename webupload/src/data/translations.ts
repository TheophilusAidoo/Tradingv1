export type Locale =
  | 'zh'
  | 'en'
  | 'pt'
  | 'de'
  | 'ru'
  | 'fr'
  | 'es'
  | 'it'
  | 'id'

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
  pt: 'Português',
  de: 'Deutsch',
  ru: 'Русский язык',
  fr: 'Français',
  es: 'Español',
  it: 'italiano',
  id: 'Bahasa indonesia',
}

export type TranslationKey =
  | 'nav.home'
  | 'nav.market'
  | 'nav.trade'
  | 'nav.features'
  | 'nav.wallets'
  | 'accountInfo.title'
  | 'accountInfo.menu.language'
  | 'accountInfo.menu.withdrawalAddress'
  | 'accountInfo.menu.password'
  | 'accountInfo.menu.notifications'
  | 'accountInfo.menu.myInvitation'
  | 'accountInfo.menu.aboutUs'
  | 'accountInfo.menu.msbApproval'
  | 'accountInfo.menu.logOut'
  | 'languageManagement.title'
  | 'changePassword.title'
  | 'changePassword.loginPassword'
  | 'changePassword.withdrawalPassword'
  | 'wallets.title'
  | 'market.title'
  | 'features.title'
  | 'trade.spot'
  | 'trade.buy'
  | 'trade.sell'
  | 'trade.limitedPrice'
  | 'trade.price'
  | 'trade.quantity'
  | 'trade.total'
  | 'trade.available'
  | 'trade.openOrders'
  | 'trade.noOrder'
  | 'wallets.totalAssets'
  | 'wallets.deposit'
  | 'wallets.withdraw'
  | 'wallets.assetList'
  | 'deposit.title'
  | 'deposit.popularCrypto'
  | 'deposit.buyCryptocurrency'
  | 'deposit.buy'
  | 'aboutUs.title'
  | 'withdrawalAddress.title'
  | 'withdrawalAddress.currencyType'
  | 'withdrawalAddress.noSavedAddress'
  | 'withdrawalAddress.addAddress'
  | 'auth.login'
  | 'auth.signUp'
  | 'auth.email'
  | 'auth.password'
  | 'order.buyUp'
  | 'order.buyFall'
  | 'order.selectionPeriod'
  | 'order.selectionLever'
  | 'order.orderAmount'
  | 'order.accountBalance'
  | 'order.projectedProfit'
  | 'order.confirmOrder'
  | 'loginPassword.title'
  | 'loginPassword.oldPassword'
  | 'loginPassword.password'
  | 'loginPassword.confirmPassword'
  | 'loginPassword.enterOldPassword'
  | 'loginPassword.enterNewPassword'
  | 'loginPassword.submit'
  | 'loginPassword.warning'
  | 'withdrawalPassword.title'
  | 'withdrawalPassword.password'
  | 'withdrawalPassword.confirmPassword'
  | 'withdrawalPassword.enterNewPassword'
  | 'withdrawalPassword.confirm'
  | 'invite.title'
  | 'invite.myInvitationCode'
  | 'invite.copyInvitationLink'
  | 'invite.firstGenerationMembers'
  | 'invite.secondGenerationMembers'
  | 'invite.approved'
  | 'invite.unapproved'
  | 'invite.numbers'
  | 'msbApproval.title'
  | 'msbApproval.uploadIdCard'
  | 'msbApproval.uploadIdCardHint'
  | 'msbApproval.dropOrClick'
  | 'msbApproval.uploaded'
  | 'msbApproval.front'
  | 'msbApproval.back'
  | 'customerService.title'
  | 'customerService.loading'
  | 'customerService.noLinks'

const en: Record<TranslationKey, string> = {
  'nav.home': 'HOME',
  'nav.market': 'MARKET',
  'nav.trade': 'TRADE',
  'nav.features': 'FEATURES',
  'nav.wallets': 'WALLETS',
  'accountInfo.title': 'ACCOUNT INFO',
  'accountInfo.menu.language': 'LANGUAGE',
  'accountInfo.menu.withdrawalAddress': 'WITHDRAWAL ADDRESS',
  'accountInfo.menu.password': 'PASSWORD',
  'accountInfo.menu.notifications': 'NOTIFICATIONS',
  'accountInfo.menu.myInvitation': 'MY INVITATION',
  'accountInfo.menu.aboutUs': 'ABOUT US',
  'accountInfo.menu.msbApproval': 'MSB APPROVAL',
  'accountInfo.menu.logOut': 'LOG OUT',
  'languageManagement.title': 'LANGUAGE MANAGEMENT',
  'changePassword.title': 'CHANGE PASSWORD',
  'changePassword.loginPassword': 'LOGIN PASSWORD',
  'changePassword.withdrawalPassword': 'WITHDRAWAL PASSWORD',
  'wallets.title': 'WALLETS',
  'market.title': 'USDT MARKET',
  'features.title': 'FEATURES',
  'trade.spot': 'SPOT',
  'trade.buy': 'BUY',
  'trade.sell': 'SELL',
  'trade.limitedPrice': 'LIMITED PRICE',
  'trade.price': 'PRICE',
  'trade.quantity': 'QUANTITY',
  'trade.total': 'TOTAL',
  'trade.available': 'AVAILABLE',
  'trade.openOrders': 'OPEN ORDERS',
  'trade.noOrder': 'NO ORDER',
  'wallets.totalAssets': 'TOTAL ACCOUNT ASSETS (USDT)',
  'wallets.deposit': 'DEPOSIT',
  'wallets.withdraw': 'WITHDRAW',
  'wallets.assetList': 'ASSET LIST',
  'deposit.title': 'Deposit',
  'deposit.popularCrypto': 'POPULAR CRYPTO',
  'deposit.buyCryptocurrency': 'BUY CRYPTOCURRENCY',
  'deposit.buy': 'BUY',
  'aboutUs.title': 'ABOUT US',
  'withdrawalAddress.title': 'CRYPTO ADDRESS MANAGEMENT',
  'withdrawalAddress.currencyType': 'CURRENCY TYPE',
  'withdrawalAddress.noSavedAddress': 'NO SAVED ADDRESS',
  'withdrawalAddress.addAddress': 'ADD ADDRESS',
  'auth.login': 'Login',
  'auth.signUp': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'order.buyUp': 'BUY UP',
  'order.buyFall': 'BUY FALL',
  'order.selectionPeriod': 'SELECTION PERIOD',
  'order.selectionLever': 'SELECTION LEVER',
  'order.orderAmount': 'ORDER AMOUNT',
  'order.accountBalance': 'ACCOUNT BALANCE: USDT',
  'order.projectedProfit': 'PROJECTED PROFIT',
  'order.confirmOrder': 'CONFIRM ORDER',
  'loginPassword.title': 'LOGIN PASSWORD',
  'loginPassword.oldPassword': 'OLD PASSWORD',
  'loginPassword.password': 'PASSWORD',
  'loginPassword.confirmPassword': 'CONFIRM PASSWORD',
  'loginPassword.enterOldPassword': 'ENTER OLD PASSWORD',
  'loginPassword.enterNewPassword': 'ENTER NEW PASSWORD',
  'loginPassword.submit': 'SUBMIT',
  'loginPassword.warning': 'For the safety of your funds, withdrawals are not allowed within 24 hours after the login password has been changed.',
  'withdrawalPassword.title': 'WITHDRAWAL PASSWORD',
  'withdrawalPassword.password': 'PASSWORD',
  'withdrawalPassword.confirmPassword': 'CONFIRM PASSWORD',
  'withdrawalPassword.enterNewPassword': 'ENTER NEW PASSWORD',
  'withdrawalPassword.confirm': 'CONFIRM',
  'invite.title': 'INVITE',
  'invite.myInvitationCode': 'MY INVITATION CODE',
  'invite.copyInvitationLink': 'COPY INVITATION LINK',
  'invite.firstGenerationMembers': 'FIRST GENERATION MEMBERS',
  'invite.secondGenerationMembers': 'SECOND GENERATION MEMBERS',
  'invite.approved': 'APPROVED',
  'invite.unapproved': 'UNAPPROVED',
  'invite.numbers': 'NUMBERS',
  'msbApproval.title': 'MSB APPROVAL',
  'msbApproval.uploadIdCard': 'UPLOAD ID CARD',
  'msbApproval.uploadIdCardHint': 'Upload front and back of your ID or passport.',
  'msbApproval.dropOrClick': 'Drop file here or click to upload',
  'msbApproval.uploaded': 'Uploaded',
  'msbApproval.front': 'ID / Passport – Front',
  'msbApproval.back': 'ID / Passport – Back',
  'customerService.title': 'CUSTOMER SERVICE',
  'customerService.loading': 'Loading...',
  'customerService.noLinks': 'No support links configured yet. Please contact the administrator.',
}

const zh: Record<TranslationKey, string> = {
  ...en,
  'nav.home': '首页',
  'nav.market': '行情',
  'nav.trade': '交易',
  'nav.features': '功能',
  'nav.wallets': '钱包',
  'accountInfo.title': '账户信息',
  'accountInfo.menu.language': '语言',
  'accountInfo.menu.withdrawalAddress': '提现地址',
  'accountInfo.menu.password': '密码',
  'accountInfo.menu.notifications': '通知',
  'accountInfo.menu.myInvitation': '我的邀请',
  'accountInfo.menu.aboutUs': '关于我们',
  'accountInfo.menu.msbApproval': 'MSB认证',
  'accountInfo.menu.logOut': '退出登录',
  'languageManagement.title': '语言管理',
  'changePassword.title': '修改密码',
  'changePassword.loginPassword': '登录密码',
  'changePassword.withdrawalPassword': '提现密码',
  'wallets.title': '钱包',
  'market.title': 'USDT市场',
  'features.title': '功能',
  'trade.spot': '现货',
  'trade.buy': '买入',
  'trade.sell': '卖出',
  'trade.limitedPrice': '限价',
  'trade.price': '价格',
  'trade.quantity': '数量',
  'trade.total': '合计',
  'trade.available': '可用',
  'trade.openOrders': '当前委托',
  'trade.noOrder': '暂无委托',
  'wallets.totalAssets': '账户总资产 (USDT)',
  'wallets.deposit': '充值',
  'wallets.withdraw': '提现',
  'wallets.assetList': '资产列表',
  'deposit.title': '充值',
  'deposit.popularCrypto': '热门币种',
  'deposit.buyCryptocurrency': '购买加密货币',
  'deposit.buy': '购买',
  'aboutUs.title': '关于我们',
  'withdrawalAddress.title': '加密货币地址管理',
  'withdrawalAddress.currencyType': '币种类型',
  'withdrawalAddress.noSavedAddress': '暂无保存的地址',
  'withdrawalAddress.addAddress': '添加地址',
  'auth.login': '登录',
  'auth.signUp': '注册',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'order.buyUp': '买涨',
  'order.buyFall': '买跌',
  'order.selectionPeriod': '选择周期',
  'order.selectionLever': '选择杠杆',
  'order.orderAmount': '下单金额',
  'order.accountBalance': '账户余额：USDT',
  'order.projectedProfit': '预计收益',
  'order.confirmOrder': '确认下单',
  'loginPassword.title': '登录密码',
  'loginPassword.oldPassword': '原密码',
  'loginPassword.password': '密码',
  'loginPassword.confirmPassword': '确认密码',
  'loginPassword.enterOldPassword': '请输入原密码',
  'loginPassword.enterNewPassword': '请输入新密码',
  'loginPassword.submit': '提交',
  'loginPassword.warning': '为保障您的资金安全，修改登录密码后24小时内不可提现。',
  'withdrawalPassword.title': '提现密码',
  'withdrawalPassword.password': '密码',
  'withdrawalPassword.confirmPassword': '确认密码',
  'withdrawalPassword.enterNewPassword': '请输入新密码',
  'withdrawalPassword.confirm': '确认',
  'invite.title': '邀请',
  'invite.myInvitationCode': '我的邀请码',
  'invite.copyInvitationLink': '复制邀请链接',
  'invite.firstGenerationMembers': '一级成员',
  'invite.secondGenerationMembers': '二级成员',
  'invite.approved': '已通过',
  'invite.unapproved': '待审核',
  'invite.numbers': '人',
  'msbApproval.title': 'MSB认证',
  'msbApproval.uploadIdCard': '上传身份证',
  'msbApproval.uploadIdCardHint': '请上传身份证或护照的正反两面。',
  'msbApproval.dropOrClick': '拖放文件或点击上传',
  'msbApproval.uploaded': '已上传',
  'msbApproval.front': '身份证/护照 – 正面',
  'msbApproval.back': '身份证/护照 – 背面',
  'customerService.title': '客户服务',
  'customerService.loading': '加载中...',
  'customerService.noLinks': '暂无客服链接配置，请联系管理员。',
}

const pt: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'INÍCIO',
  'nav.market': 'MERCADO',
  'nav.trade': 'NEGOCIAR',
  'nav.features': 'RECURSOS',
  'nav.wallets': 'CARTEIRAS',
  'accountInfo.title': 'INFO DA CONTA',
  'languageManagement.title': 'GERENCIAMENTO DE IDIOMA',
}

const de: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'START',
  'nav.market': 'MARKT',
  'nav.trade': 'HANDEL',
  'nav.features': 'FUNKTIONEN',
  'nav.wallets': 'GELDBÖRSEN',
  'accountInfo.title': 'KONTOINFO',
  'languageManagement.title': 'SPRACHVERWALTUNG',
}

const ru: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'ГЛАВНАЯ',
  'nav.market': 'РЫНОК',
  'nav.trade': 'ТОРГОВЛЯ',
  'nav.features': 'ФУНКЦИИ',
  'nav.wallets': 'КОШЕЛЬКИ',
  'accountInfo.title': 'ИНФОРМАЦИЯ О СЧЁТЕ',
  'languageManagement.title': 'УПРАВЛЕНИЕ ЯЗЫКОМ',
}

const fr: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'ACCUEIL',
  'nav.market': 'MARCHÉ',
  'nav.trade': 'TRADING',
  'nav.features': 'FONCTIONNALITÉS',
  'nav.wallets': 'PORTEFEUILLES',
  'accountInfo.title': 'INFOS COMPTE',
  'languageManagement.title': 'GESTION DE LA LANGUE',
}

const es: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'INICIO',
  'nav.market': 'MERCADO',
  'nav.trade': 'OPERAR',
  'nav.features': 'FUNCIONES',
  'nav.wallets': 'MONEDEROS',
  'accountInfo.title': 'INFO DE CUENTA',
  'languageManagement.title': 'GESTIÓN DE IDIOMA',
}

const it: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'HOME',
  'nav.market': 'MERCATO',
  'nav.trade': 'TRADING',
  'nav.features': 'FUNZIONI',
  'nav.wallets': 'PORTAFOGLI',
  'accountInfo.title': 'INFO ACCOUNT',
  'languageManagement.title': 'GESTIONE LINGUA',
}

const id: Record<TranslationKey, string> = {
  ...en,
  'nav.home': 'BERANDA',
  'nav.market': 'PASAR',
  'nav.trade': 'PERDAGANGAN',
  'nav.features': 'FITUR',
  'nav.wallets': 'DOMPET',
  'accountInfo.title': 'INFO AKUN',
  'languageManagement.title': 'MANAJEMEN BAHASA',
}

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  zh,
  pt,
  de,
  ru,
  fr,
  es,
  it,
  id,
}

const STORAGE_KEY = 'river-locale'

export function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (translations as Record<string, unknown>)[stored]) return stored as Locale
  } catch {
    /* ignore */
  }
  return 'en'
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

import { useState } from 'react'
import { NetworkBackground } from './components/NetworkBackground'
import { Header } from './components/Header'
import { BannerCarousel } from './components/BannerCarousel'
import { ActionButtons } from './components/ActionButtons'
import { FeaturedCrypto } from './components/FeaturedCrypto'
import { CryptoTable } from './components/CryptoTable'
import { MarketView } from './components/MarketView'
import { TradeView } from './components/TradeView'
import { WalletsView } from './components/WalletsView'
import { FeaturesView } from './components/FeaturesView'
import { BottomNav, type NavTab } from './components/BottomNav'
import { AuthModal } from './components/AuthModal'
import { AccountInfoView } from './components/AccountInfoView'
import { AboutUsView } from './components/AboutUsView'
import { WithdrawalAddressView } from './components/WithdrawalAddressView'
import { LanguageManagementView } from './components/LanguageManagementView'
import { ChangePasswordView } from './components/ChangePasswordView'
import { LoginPasswordView } from './components/LoginPasswordView'
import { WithdrawalPasswordView } from './components/WithdrawalPasswordView'
import { MyInvitationView } from './components/MyInvitationView'
import { NotificationsView } from './components/NotificationsView'
import { MsbApprovalView } from './components/MsbApprovalView'
import { StakingView } from './components/StakingView'
import { CustomerServiceCenterView } from './components/CustomerServiceCenterView'
import { RiverCustomerServiceChatView } from './components/RiverCustomerServiceChatView'
import { useLivePrices } from './hooks/useLivePrices'
import { useVerification } from './contexts/VerificationContext'
import { addUser } from './data/verificationStore'
import { markReferralCodeAsUsed } from './data/referralCodesStore'
import { isApiConfigured, apiAuthLogin, apiAuthSignup } from './data/apiBridge'
import { getUsers } from './data/verificationStore'

type AuthMode = 'login' | 'signup'

function App() {
  const { featured, list, loading, error } = useLivePrices()
  const { currentUser, setCurrentUserId, refreshUser } = useVerification()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [accountInfoOpen, setAccountInfoOpen] = useState(false)
  const [aboutUsOpen, setAboutUsOpen] = useState(false)
  const [withdrawalAddressOpen, setWithdrawalAddressOpen] = useState(false)
  const [languageManagementOpen, setLanguageManagementOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [loginPasswordOpen, setLoginPasswordOpen] = useState(false)
  const [withdrawalPasswordOpen, setWithdrawalPasswordOpen] = useState(false)
  const [myInvitationOpen, setMyInvitationOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [msbApprovalOpen, setMsbApprovalOpen] = useState(false)
  const [stakingOpen, setStakingOpen] = useState(false)
  const [customerServiceOpen, setCustomerServiceOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [depositScreenOpen, setDepositScreenOpen] = useState(false)
  const [openDepositWhenWallets, setOpenDepositWhenWallets] = useState(false)
  const [openWithdrawalWhenWallets, setOpenWithdrawalWhenWallets] = useState(false)
  const [tradePair, setTradePair] = useState('ETH/USDT')
  const tradePairData = list.find((p) => p.symbol === tradePair)

  return (
    <div className={`app${depositScreenOpen ? ' deposit-screen-open' : ''}`}>
      <NetworkBackground />
      <Header
        onProfileClick={() => {
          if (currentUser) setAccountInfoOpen(true)
          else setAuthOpen(true)
        }}
        onLogoClick={() => {
          setActiveTab('home')
          setAccountInfoOpen(false)
        }}
      />
      <main className={`main ${activeTab === 'trade' ? 'trade-view' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
        {activeTab === 'home' && (
          <div className="card">
            <BannerCarousel />
            <ActionButtons
              onStakingClick={() => setStakingOpen(true)}
              onDepositClick={() => {
                setActiveTab('wallets')
                setOpenDepositWhenWallets(true)
              }}
              onWithdrawClick={() => {
                setActiveTab('wallets')
                setOpenWithdrawalWhenWallets(true)
              }}
              onServicesClick={() => setCustomerServiceOpen(true)}
            />
            {error && (
              <div style={{ padding: '8px 20px', fontSize: 12, color: 'var(--negative)' }}>
                {error}
              </div>
            )}
            <FeaturedCrypto pairs={featured} loading={loading} />
            <CryptoTable list={list} loading={loading} />
          </div>
        )}
        {activeTab === 'market' && <MarketView list={list} loading={loading} />}
        {activeTab === 'trade' && (
          <TradeView
            pair={tradePair}
            lastPrice={tradePairData?.lastPrice}
            change24h={tradePairData?.change24h}
            list={list}
            onSelectPair={setTradePair}
          />
        )}
        {activeTab === 'wallets' && (
          <WalletsView
            openDepositOnMount={openDepositWhenWallets}
            onDepositMountConsumed={() => setOpenDepositWhenWallets(false)}
            openWithdrawalOnMount={openWithdrawalWhenWallets}
            onWithdrawalMountConsumed={() => setOpenWithdrawalWhenWallets(false)}
            priceList={list}
            onOpenWithdrawalAddress={() => {
              setAccountInfoOpen(true)
              setWithdrawalAddressOpen(true)
            }}
            onOpenWithdrawalPassword={() => {
              setWithdrawalPasswordOpen(true)
            }}
            onBackToHome={() => setActiveTab('home')}
            onDepositScreenOpenChange={setDepositScreenOpen}
          />
        )}
        {activeTab === 'features' && (
          <FeaturesView
            pair="ETH/USDT"
            lastPrice={list.find((p) => p.symbol === 'ETH/USDT')?.lastPrice}
            change24h={list.find((p) => p.symbol === 'ETH/USDT')?.change24h}
            list={list}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} hidden={depositScreenOpen} />
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSwitchToSignUp={() => setAuthMode('signup')}
        onSwitchToLogin={() => setAuthMode('login')}
        onLoginSuccess={async (email, password) => {
          if (isApiConfigured()) {
            const user = await apiAuthLogin(email, password)
            if (user) {
              setCurrentUserId(user.id)
              return user.id
            }
            return null
          }
          const u = getUsers().find((x) => x.email === email)
          setCurrentUserId(u?.id ?? '1')
        }}
        onSignupSuccess={async (data) => {
          if (isApiConfigured()) {
            const user = await apiAuthSignup(data.email, data.password, undefined, data.referralCode)
            if (user) {
              setCurrentUserId(user.id)
              return user.id
            }
            return null
          }
          const newUser = addUser(data.email, undefined, data.referralCode)
          markReferralCodeAsUsed(data.referralCode, newUser.id)
          setCurrentUserId(newUser.id)
        }}
      />
      <AccountInfoView
        open={accountInfoOpen}
        onClose={() => setAccountInfoOpen(false)}
        onOpen={() => refreshUser()}
        email={currentUser?.email}
        referralCode={currentUser?.referralCodeUsed}
        creditScore={currentUser?.creditScore}
        onAboutUsClick={() => setAboutUsOpen(true)}
        onWithdrawalAddressClick={() => setWithdrawalAddressOpen(true)}
        onLanguageClick={() => setLanguageManagementOpen(true)}
        onPasswordClick={() => setChangePasswordOpen(true)}
        onMyInvitationClick={() => setMyInvitationOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onMsbApprovalClick={() => setMsbApprovalOpen(true)}
        onCustomerServiceClick={() => setCustomerServiceOpen(true)}
        onLogoutClick={() => {
          setCurrentUserId(null)
          setAccountInfoOpen(false)
        }}
      />
      <AboutUsView
        open={aboutUsOpen}
        onClose={() => setAboutUsOpen(false)}
      />
      <WithdrawalAddressView
        open={withdrawalAddressOpen}
        onClose={() => setWithdrawalAddressOpen(false)}
      />
      <LanguageManagementView
        open={languageManagementOpen}
        onClose={() => setLanguageManagementOpen(false)}
      />
      <ChangePasswordView
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onLoginPasswordClick={() => {
          setChangePasswordOpen(false)
          setLoginPasswordOpen(true)
        }}
        onWithdrawalPasswordClick={() => {
          setChangePasswordOpen(false)
          setWithdrawalPasswordOpen(true)
        }}
      />
      <LoginPasswordView
        open={loginPasswordOpen}
        onClose={() => setLoginPasswordOpen(false)}
      />
      <WithdrawalPasswordView
        open={withdrawalPasswordOpen}
        onClose={() => setWithdrawalPasswordOpen(false)}
      />
      <MyInvitationView
        open={myInvitationOpen}
        onClose={() => setMyInvitationOpen(false)}
        email={currentUser?.email}
        referralCode={currentUser?.referralCodeUsed}
      />
      <NotificationsView
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <MsbApprovalView
        open={msbApprovalOpen}
        onClose={() => setMsbApprovalOpen(false)}
      />
      <StakingView
        open={stakingOpen}
        onClose={() => setStakingOpen(false)}
      />
      <CustomerServiceCenterView
        open={customerServiceOpen}
        onOpenChat={() => setChatOpen(true)}
        onClose={() => setCustomerServiceOpen(false)}
      />
      <RiverCustomerServiceChatView
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  )
}

export default App

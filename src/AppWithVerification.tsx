import { useState } from 'react'
import { useVerification } from './contexts/VerificationContext'
import { AccountLockedView } from './components/AccountLockedView'
import { RiverCustomerServiceChatView } from './components/RiverCustomerServiceChatView'
import App from './App'

export function AppWithVerification() {
  const { currentUser } = useVerification()
  const [chatOpen, setChatOpen] = useState(false)

  if (currentUser?.locked) {
    return (
      <>
        <AccountLockedView onOpenRiverCustomerService={() => setChatOpen(true)} />
        <RiverCustomerServiceChatView
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </>
    )
  }

  return <App />
}

import { Activities } from '@/components/Activities'
import { CartDrawer } from '@/components/CartDrawer'
import { Companion } from '@/components/Companion'
import { Faq } from '@/components/Faq'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Packages } from '@/components/Packages'
import { PaywallModal } from '@/components/PaywallModal'
import { Planner } from '@/components/Planner'
import { Plans } from '@/components/Plans'
import { SearchPanel } from '@/components/SearchPanel'
import { Stays } from '@/components/Stays'
import { VoiceGuide } from '@/components/VoiceGuide'
import { AppProvider } from '@/state/store'

export default function App() {
  return (
    <AppProvider>
      <Header />

      <main>
        <Hero />
        <SearchPanel />
        <Planner />
        <Companion />
        <Stays />
        <Activities />
        <Packages />
        <Plans />
        <Faq />
      </main>

      <Footer />

      {/* Overlays */}
      <CartDrawer />
      <PaywallModal />
      <VoiceGuide />
    </AppProvider>
  )
}

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './landing/Landing'
import { Privacy, Terms, NotFound } from './landing/Pages'
import { RosterPage } from './toolkit/Roster'
import { AssistantPage } from './toolkit/Assistant'
import { Home } from './routes/Home'
import { Learn } from './routes/Learn'
import { Play } from './routes/Play'
import { Parents } from './routes/Parents'
import { ToolkitHub, ToolPage, LibraryPage, DrillsPage } from './toolkit/Toolkit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route element={<Layout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/learn/:domain" element={<Learn />} />
          <Route path="/play/:domain" element={<Play />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/toolkit" element={<ToolkitHub />} />
          <Route path="/toolkit/roster" element={<RosterPage />} />
          <Route path="/toolkit/assistant" element={<AssistantPage />} />
          <Route path="/toolkit/library" element={<LibraryPage />} />
          <Route path="/toolkit/drills" element={<DrillsPage />} />
          <Route path="/toolkit/:tool" element={<ToolPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

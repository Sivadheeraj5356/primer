import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './landing/Landing'
import { Privacy, Terms, NotFound } from './landing/Pages'
import { Home } from './routes/Home'
import { Learn } from './routes/Learn'
import { Play } from './routes/Play'
import { Parents } from './routes/Parents'

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
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

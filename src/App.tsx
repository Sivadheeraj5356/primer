import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Landing } from './routes/Landing'
import { Home } from './routes/Home'
import { Learn } from './routes/Learn'
import { Play } from './routes/Play'
import { Parents } from './routes/Parents'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/learn/:domain" element={<Learn />} />
          <Route path="/play/:domain" element={<Play />} />
          <Route path="/parents" element={<Parents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

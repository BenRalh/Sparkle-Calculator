import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SolMateApp from './SolMateApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SolMateApp />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { sleepContentService } from './services/sleepContentService.ts'

// Non-blocking background sync with Supabase (if configured)
sleepContentService.init().catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

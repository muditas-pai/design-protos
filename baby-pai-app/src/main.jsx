import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// The design system, consumed by relative path — never copied into this app.
// It must load first so styles/tokens.css can alias its variables.
import '../../design-system/pai.css'

import './styles/tokens.css'
import './styles/chrome.css'
import './styles/dashboard.css'
import './styles/editor.css'
import './styles/flow.css'
import './styles/annotations.css'
import './styles/index-page.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

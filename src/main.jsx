import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ProjectProvider } from './context/ProjectContext'
import { LangProvider } from './context/LangContext'
import { CompareProvider } from './context/CompareContext'
import { SessionProvider } from './context/SessionContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <LangProvider>
        <ProjectProvider>
          <CompareProvider>
            <SessionProvider>
              <App />
            </SessionProvider>
          </CompareProvider>
        </ProjectProvider>
      </LangProvider>
    </HashRouter>
  </React.StrictMode>
)

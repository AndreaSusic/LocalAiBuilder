import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import './App.css'

export default function App() {
  const [showPreview, setShowPreview] = useState(false)
  const [versions] = useState(['Version 1', 'Version 2', 'Version 3'])
  return (
    <div className="app-container">
      <header className="top-bar">
        <button className="btn icon">☰</button>
        <button className="btn icon">🔔</button>
        <button className="btn small">Publish</button>
        <button className="btn small" onClick={() => setShowPreview(true)}>View Preview</button>
      </header>

      <main className="dashboard-grid">
        <section className="versions-panel">
          <input className="search" placeholder="Search versions…" />
          <ul className="versions">
            {versions.map(v => <li key={v}>{v}</li>)}
          </ul>
        </section>

        <section className="editor-panel">
          <h2>Chat with AI</h2>
          <textarea className="chat-input" placeholder="Type your message…" />
          <button className="btn send">Send</button>
        </section>
      </main>

      <Dialog open={showPreview} onClose={() => setShowPreview(false)} className="preview-dialog">
        <div className="overlay">
          <Dialog.Panel className="preview-panel">
            <button className="btn close" onClick={() => setShowPreview(false)}>×</button>
            <iframe src="about:blank" title="Live Preview" className="preview-iframe" />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
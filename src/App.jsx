import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InvoicePage from './pages/invoicePage'
import InvoiceDetailsPage from './pages/invoiceDetailsPage'
function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<InvoicePage />} />
          <Route path='/invoices/:invoiceId' element={<InvoiceDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

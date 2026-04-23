import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { getInvoices, deleteInvoice, updateInvoice } from "../../data"
import Status from "../components/status"
import Header from "../components/header"
import InvoiceActions from "../components/invoiceActions"
import Form from "../components/form"
import Modal from "../components/modal"

function formatDate(value) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
    return `£ ${Number(value || 0).toFixed(2)}`
}

function InvoiceDetailsPage() {
    const { invoiceId } = useParams()
    const navigate = useNavigate()
    const [selectedInvoice, setSelectedInvoice] = useState(() =>
        getInvoices().find((invoice) => invoice.invoiceId === invoiceId)
    )
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    if (!selectedInvoice) {
        return (
            <>
                <Header />
                <main className="not__found">
                    <h1>Invoice not found</h1>
                    <p>We couldn't find an invoice with that ID.</p>
                    <button type="button" className="form__save" onClick={() => navigate('/')}>Back to invoices</button>
                </main>
            </>
        )
    }
    const handleGoBack = function () {
        if (isEditing) {
            setIsEditing(false)
            return
        }
        navigate(-1)
    }
    function handleEdit() {
        setIsEditing(true)
    }
    function handleDelete() {
        setShowDeleteModal(true)
    }
    function confirmDelete() {
        deleteInvoice(invoiceId)
        navigate('/')
    }
    function handleMarkAsPaid() {
        updateInvoice(invoiceId, { status: 'paid' })
        setSelectedInvoice((prev) => ({ ...prev, status: 'paid' }))
    }
    function handleSaved() {
        const refreshed = getInvoices().find((invoice) => invoice.invoiceId === invoiceId)
        setSelectedInvoice(refreshed)
        setIsEditing(false)
    }
    function handleCancelEdit() {
        setIsEditing(false)
    }
    const items = selectedInvoice.items || []
    return (<div style={{ position: "relative", height: "100dvh" }}>
        <Header />
        <div className="go__back" onClick={handleGoBack}><span>&lt;</span> Go Back</div>
        {isEditing ? (
            <Form action="Edit" initialData={selectedInvoice} invoiceId={invoiceId} onSaved={handleSaved} onCancel={handleCancelEdit} />
        ) : (
            <>
                <div className="invoice__details--main">
                    <div className="invoice__details--status">
                        <div className="">Status</div>
                        <div className=""><Status invoice={selectedInvoice} /></div>
                    </div>
                    <div className="invoice__details--details">
                        <div className="invoice__id-row">
                            <h2 className="invoice__id"><span className="hash">#</span>{selectedInvoice.invoiceId}</h2>
                            <p className="invoice__description">{selectedInvoice.projectDescription}</p>
                        </div>
                        <address className="invoice__bill-from">
                            <p>{selectedInvoice.streetAddress}</p>
                            <p>{selectedInvoice.city}</p>
                            <p>{selectedInvoice.postCode}</p>
                            <p>{selectedInvoice.country}</p>
                        </address>
                        <div className="invoice__meta">
                            <div className="invoice__meta-col">
                                <p className="invoice__meta-label">Invoice Date</p>
                                <p className="invoice__meta-value">{formatDate(selectedInvoice.invoiceDate)}</p>
                                <p className="invoice__meta-label">Payment Due</p>
                                <p className="invoice__meta-value">{formatDate(selectedInvoice.dueDate)}</p>
                            </div>
                            <div className="invoice__meta-col">
                                <p className="invoice__meta-label">Bill To</p>
                                <p className="invoice__meta-value">{selectedInvoice.clientName}</p>
                                <address>
                                    <p>{selectedInvoice.clientStreetAddress}</p>
                                    <p>{selectedInvoice.clientCity}</p>
                                    <p>{selectedInvoice.clientPostCode}</p>
                                    <p>{selectedInvoice.clientCountry}</p>
                                </address>
                            </div>
                        </div>
                        <div className="invoice__sent-to">
                            <p className="invoice__meta-label">Sent to</p>
                            <p className="invoice__meta-value">{selectedInvoice.clientEmail}</p>
                        </div>
                        <div className="invoice__items">
                            <ul className="invoice__items-list">
                                {items.map((item, idx) => (
                                    <li key={idx} className="invoice__item-row">
                                        <div className="invoice__item-name">
                                            <p className="invoice__item-title">{item.name}</p>
                                            <p className="invoice__item-qty">{item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="invoice__item-total">{formatCurrency(Number(item.quantity || 0) * Number(item.price || 0))}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="invoice__amount-due">
                                <p>Amount Due</p>
                                <p className="invoice__amount-due-value">{formatCurrency(selectedInvoice.amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <footer>
                    <InvoiceActions>
                        <button className="invoice__action edit" onClick={handleEdit}>Edit</button>
                        <button className="invoice__action delete" onClick={handleDelete}>Delete</button>
                        <button className="invoice__action mark-as-paid" onClick={handleMarkAsPaid} disabled={selectedInvoice.status === 'paid'}>Mark as Paid</button>
                    </InvoiceActions>
                </footer>
            </>
        )}
        {showDeleteModal && (
            <div className="modal__overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
                <div className="modal">
                    <h2 id="delete-modal-title" className="modal__title">Confirm Deletion</h2>
                    <p className="modal__message">
                        Are you sure you want to delete invoice #{invoiceId}? This action cannot be undone.
                    </p>
                    <div className="modal__actions">
                        <button type="button" className="modal__button cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button type="button" className="modal__button delete" onClick={confirmDelete}>Delete</button>
                    </div>
                </div>
            </div>
        )}
    </div>)
}
export default InvoiceDetailsPage
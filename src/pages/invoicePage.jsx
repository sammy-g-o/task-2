import Header from "../components/header"
import InvoiceCard from "../components/invoiceCard"
import EmptyMessage from "../components/emptyMessage"
import Form from "../components/form"
import { getInvoices } from "../../data"
import { useEffect, useRef, useState } from "react"

const STATUS_OPTIONS = ['paid', 'pending', 'draft']

function InvoicePage() {
    const [invoices, setInvoices] = useState(() => getInvoices())
    const [showAddNewForm, setShowAddNewform] = useState(false);
    const [statusFilter, setStatusFilter] = useState([])
    const [filterOpen, setFilterOpen] = useState(false)
    const filterRef = useRef(null)
    useEffect(() => {
        if (!filterOpen) return
        function handleClick(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [filterOpen])
    function handleShowAddNewForm() {
        setShowAddNewform(addNew => !addNew)
    }
    function handleInvoiceSaved() {
        setInvoices(getInvoices())
        setShowAddNewform(false)
    }
    function toggleStatus(status) {
        setStatusFilter((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        )
    }
    const visibleInvoices = statusFilter.length === 0
        ? invoices
        : invoices.filter((invoice) => statusFilter.includes(invoice.status))
    return (
        <>
            <Header />
            {!showAddNewForm ? <div className="invoice__page--dock">
                <div className="invoice__page--summary">
                    <h1>Invoices</h1>
                    <p aria-live="polite">{visibleInvoices.length} {visibleInvoices.length === 1 ? 'invoice' : 'invoices'}</p>
                </div>
                <div className="filter_new">
                    <div className="filter__wrapper" ref={filterRef}>
                        <button type="button" className="filter" onClick={() => setFilterOpen((o) => !o)} aria-haspopup="true" aria-expanded={filterOpen}>
                            <span className="filter__label--mobile">Filter</span>
                            <span className="filter__label--desktop">Filter by status</span>
                            <span className="filter__caret" aria-hidden="true">{filterOpen ? '▴' : '▾'}</span>
                        </button>
                        {filterOpen && (
                            <div className="filter__menu" role="group" aria-label="Filter invoices by status">
                                {STATUS_OPTIONS.map((status) => (
                                    <label key={status} className="filter__option">
                                        <input
                                            type="checkbox"
                                            checked={statusFilter.includes(status)}
                                            onChange={() => toggleStatus(status)}
                                        />
                                        <span>{status[0].toUpperCase() + status.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="button" className="new-invoice" onClick={handleShowAddNewForm}>
                        <span className="circle" aria-hidden="true">+</span>
                        <span className="new-invoice__label--mobile">New</span>
                        <span className="new-invoice__label--desktop">New Invoice</span>
                    </button>
                </div>
            </div> : <button type="button" className="go__back" onClick={handleShowAddNewForm}><span aria-hidden="true">&lt;</span> Go Back</button>}
            <main className="invoice__page--main">
                {(visibleInvoices.length === 0 && showAddNewForm === false) && (
                    <EmptyMessage filtered={statusFilter.length > 0} />
                )}
                {(visibleInvoices.length > 0 && showAddNewForm === false) && (
                    <ul className="invoice__list">
                        {visibleInvoices.map((invoice) => (
                            <li key={invoice.invoiceId}>
                                <InvoiceCard invoice={invoice} />
                            </li>
                        ))}
                    </ul>
                )}
                {showAddNewForm && <Form action="New invoice" onSaved={handleInvoiceSaved} onCancel={handleShowAddNewForm} />}
            </main>
        </>
    )
}
export default InvoicePage
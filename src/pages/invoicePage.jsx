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
                <div className="">
                    <h2>Invoices</h2>
                    <p>{visibleInvoices.length} {visibleInvoices.length === 1 ? 'invoice' : 'invoices'}</p>
                </div>
                <div className="filter_new">
                    <div className="filter__wrapper" ref={filterRef}>
                        <button type="button" className="filter" onClick={() => setFilterOpen((o) => !o)} aria-haspopup="true" aria-expanded={filterOpen}>
                            Filter <span className="filter__caret">{filterOpen ? '▴' : '▾'}</span>
                        </button>
                        {filterOpen && (
                            <div className="filter__menu" role="menu">
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
                    <div className="new-invoice" onClick={handleShowAddNewForm}>
                        <div className="circle"></div>
                        <p>New</p>
                    </div>
                </div>
            </div> : <div className="go__back" onClick={handleShowAddNewForm}><span>&lt;</span> Go Back</div>}
            <main className="invoice__page--main">
                {(visibleInvoices.length === 0 && showAddNewForm === false) && <EmptyMessage />}
                {(visibleInvoices.length > 0 && showAddNewForm === false) && <>{visibleInvoices?.map((invoice) => <InvoiceCard invoice={invoice} key={invoice.invoiceId} />)}</>}
                {showAddNewForm && <Form action="New invoice" onSaved={handleInvoiceSaved} onCancel={handleShowAddNewForm} />}
            </main>
        </>
    )
}
export default InvoicePage
import { NavLink } from "react-router-dom"
import Status from "./status"

function formatDate(value) {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value) {
    return `£ ${Number(value || 0).toFixed(2)}`
}

function InvoiceCard({ invoice }) {
    return (
        <NavLink className="card__container" to={`/invoices/${encodeURIComponent(invoice.invoiceId)}`}>
            <div className="card__row row--1">
                <div className="card__id"><span className="hash">#</span>{invoice.invoiceId}</div>
                <div className="card__client-name">{invoice.name}</div>
            </div>
            <div className="card__row row--2">
                <div className="date__amount">
                    <div className="due--date">Due <time dateTime={invoice.dueDate}>{formatDate(invoice.dueDate)}</time></div>
                    <div className="card__amount">{formatCurrency(invoice.amount)}</div>
                </div>
                <Status invoice={invoice} />
            </div>
        </NavLink>
    )
}
export default InvoiceCard
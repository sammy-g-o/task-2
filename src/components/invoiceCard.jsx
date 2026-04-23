import { NavLink } from "react-router-dom"
import Status from "./status"
function InvoiceCard({ invoice }) {

    return (
        <NavLink className="card__container" to={`/invoices/${encodeURIComponent(invoice.invoiceId)}`}>
            <div className="card__row row--1">
                <div className="">{invoice.invoiceId}</div>
                <div className="">{invoice.name}</div>
            </div>
            <div className="card__row row--2">
                <div className="date__amount">
                    <div className="due--date">Due <time dateTime={invoice.dueDate}>{invoice.dueDate}</time></div>
                    <div className="">{invoice.amount}</div>
                </div>
                <Status invoice={invoice}/>
            </div>
        </NavLink>
    )
}
export default InvoiceCard
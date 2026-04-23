function Status({ invoice }) {
    const status = invoice.status || 'draft'
    const label = status.charAt(0).toUpperCase() + status.slice(1)
    return (
        <div className={`invoice__status ${status}`} aria-label={`Status: ${label}`}>
            <span className="invoice__status-dot" aria-hidden="true" />
            <span>{label}</span>
        </div>
    )
}
export default Status
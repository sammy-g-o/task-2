function Status({ invoice }) {
    return (
        <div className={`invoice__status ${invoice.status === 'paid' ? 'paid' : ''} ${invoice.status === 'pending' ? 'pending' : ''} ${invoice.status === 'draft' ? 'draft' : ''}`}>{invoice.status}</div>)
}
export default Status
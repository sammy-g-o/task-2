function EmptyMessage({ filtered = false }) {
    return (
        <div className="nothing__here--container">
            <div className="nothing__here--wrap">
                <img src="/empty.svg" alt="" />
                <div className="empty__Message">
                    <h2>There is nothing here</h2>
                    <p className="subheading">
                        {filtered
                            ? 'No invoices match the selected filter. Try a different status or clear the filter.'
                            : 'Create an invoice by clicking the New button and get started'}
                    </p>
                </div>
            </div>
        </div>
    )
}
export default EmptyMessage
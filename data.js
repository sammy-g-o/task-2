const STORAGE_KEY = 'invoices'

const seedInvoices = [
    {
        invoiceId: "RT3080",
        dueDate: "19 aug 2021",
        name: "jenseng huan",
        amount: 1800,
        status: "paid"
    }
]

export function getInvoices() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw === null) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedInvoices))
            return seedInvoices
        }
        return JSON.parse(raw)
    } catch {
        return []
    }
}

export function saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
}

export function addInvoice(invoice) {
    const all = getInvoices()
    const updated = [...all, invoice]
    saveInvoices(updated)
    return updated
}

export function updateInvoice(invoiceId, patch) {
    const all = getInvoices()
    const updated = all.map((invoice) =>
        invoice.invoiceId === invoiceId ? { ...invoice, ...patch } : invoice
    )
    saveInvoices(updated)
    return updated
}

export function deleteInvoice(invoiceId) {
    const all = getInvoices()
    const updated = all.filter((invoice) => invoice.invoiceId !== invoiceId)
    saveInvoices(updated)
    return updated
}

export function generateInvoiceId() {
    const n = Math.floor(1000 + Math.random() * 9000)
    return `RT${n}`
}
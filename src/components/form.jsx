import { useState } from "react"
import { addInvoice, updateInvoice, generateInvoiceId } from "../../data"

function computeDueDate(invoiceDate, paymentTerms) {
    if (!invoiceDate) return ''
    const days = Number(paymentTerms) || 0
    const date = new Date(invoiceDate)
    if (isNaN(date.getTime())) return ''
    date.setDate(date.getDate() + days)
    return date.toISOString().slice(0, 10)
}

function computeAmount(items) {
    return items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
    )
}

function Form({ action, onSaved, onCancel, initialData, invoiceId }) {
    const [formData, setFormData] = useState(() => ({
        streetAddress: '',
        city: '',
        postCode: '',
        country: '',
        clientName: '',
        clientEmail: '',
        invoiceDate: '',
        paymentTerms: '30',
        projectDescription: '',
        clientStreetAddress: '',
        clientPostCode: '',
        clientCity: '',
        clientCountry: '',
        items: [],
        ...initialData,
    }))
    function handleChange(e) {
        const { name, value } = e.target
        setFormData((prevdata) => ({
            ...prevdata, [name]: value
        }))
    }
    function handleItemChange(index, field, value) {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }))
    }
    function handleAddItem() {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: 1, price: 0 }],
        }))
    }
    function handleRemoveItem(index) {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }))
    }
    function handleSubmit(e) {
        e.preventDefault()
        const amount = computeAmount(formData.items)
        const dueDate = computeDueDate(formData.invoiceDate, formData.paymentTerms)
        if (invoiceId) {
            updateInvoice(invoiceId, {
                ...formData,
                name: formData.clientName,
                dueDate,
                amount,
            })
        } else {
            const newInvoice = {
                ...formData,
                invoiceId: generateInvoiceId(),
                name: formData.clientName,
                dueDate,
                amount,
                status: 'pending',
            }
            addInvoice(newInvoice)
        }
        onSaved?.()
    }
    return (
        <div className="form__container">
            <h2 className="form__action">{action}{invoiceId ? <> <span className="hash">#</span>{invoiceId}</> : ''}</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="bill__from">
                    <h3 className="form__section-heading">Bill From</h3>
                    <div className="form__row">
                        <label htmlFor="streetAddress">Street Address</label>
                        <input type="text" id="" value={formData.streetAddress} onChange={handleChange} name="streetAddress" />
                    </div>
                    <div className="form__row grouped__input">
                        <div>
                            <label htmlFor="city">City</label>
                            <input type="text" id="" value={formData.city} onChange={handleChange} name="city" />
                        </div>
                        <div>

                            <label htmlFor="postCode">Post Code</label>
                            <input type="text" id="" value={formData.postCode} onChange={handleChange} name="postCode" />
                        </div>
                    </div>
                    <div className="form__row">
                        <label htmlFor="country">Country</label>
                        <input type="text" id="" value={formData.country} onChange={handleChange} name="country" />
                    </div>


                </div>
                <div className="bill__to">
                    <h3 className="form__section-heading">Bill To</h3>
                    <div className="form__row">
                        <label htmlFor="clientName">Client Name</label>
                        <input type="text" id="" value={formData.clientName} onChange={handleChange} name="clientName" />
                    </div>
                    <div className="form__row">
                        <label htmlFor="clientEmail">Client Email</label>
                        <input type="text" id="" value={formData.clientEmail} onChange={handleChange} name="clientEmail" />
                    </div>
                    <div className="form__row">
                        <label htmlFor="clientStreetAddress">Street Address</label>
                        <input type="text" id="" value={formData.clientStreetAddress} onChange={handleChange} name="clientStreetAddress" />
                    </div>
                    <div className="form__row grouped__input">
                        <div>
                            <label htmlFor="clientCity"> Client City</label>
                            <input type="text" id="" value={formData.clientCity} onChange={handleChange} name="clientCity" />
                        </div>

                        <div>
                            <label htmlFor="postCode">Post Code</label>
                            <input type="text" id="" value={formData.clientPostCode} onChange={handleChange} name="postCode" />
                        </div>
                    </div>
                    <div className="form__row">
                        <label htmlFor="clientCountry">Country</label>
                        <input type="text" id="" value={formData.clientCountry} onChange={handleChange} name="clientCountry" />
                    </div>
                    <div className="form__row">
                        <label htmlFor="invoiceDate">Invoice Date</label>
                        <input type="date" id="" value={formData.invoiceDate} onChange={handleChange} name="invoiceDate" />
                    </div>
                    <div className="form__row">
                        <label htmlFor="paymentTerms">Payment Terms</label>
                        <select id="" value={formData.paymentTerms} onChange={handleChange} name="paymentTerms">
                            <option value="1">Net 1 Day</option>
                            <option value="7">Net 7 Days</option>
                            <option value="14">Net 14 Days</option>
                            <option value="30">Net 30 Days</option>
                        </select>
                    </div>
                    <div className="form__row">
                        <label htmlFor="projectDescription">Project / Description</label>
                        <input type="text" id="" value={formData.projectDescription} onChange={handleChange} name="projectDescription" />
                    </div>

                </div>
                <div className="form__items">
                    <h3 className="form__items-heading">Item List</h3>
                    {formData.items.map((item, idx) => (
                        <div key={idx} className="form__item">
                            <div className="form__row">
                                <label>Item Name</label>
                                <input type="text" value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} />
                            </div>
                            <div className="form__row grouped__input form__item-row">
                                <div>
                                    <label>Qty</label>
                                    <input type="number" min="0" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                                </div>
                                <div>
                                    <label>Price</label>
                                    <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} />
                                </div>
                                <div>
                                    <label>Total</label>
                                    <p className="form__item-total">{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</p>
                                </div>
                                <button type="button" className="form__item-remove" onClick={() => handleRemoveItem(idx)} aria-label="Remove item">🗑</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="form__add-item" onClick={handleAddItem}>+ Add New Item</button>
                </div>
                <div className="form__actions">
                    <button type="button" className="form__cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="form__save">{invoiceId ? 'Save Changes' : 'Save'}</button>
                </div>
            </form>
        </div>
    )
}
export default Form
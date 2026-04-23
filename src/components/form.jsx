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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForSend(data) {
    const errors = {}
    const required = [
        'streetAddress', 'city', 'postCode', 'country',
        'clientName', 'clientEmail',
        'clientStreetAddress', 'clientCity', 'clientPostCode', 'clientCountry',
        'invoiceDate', 'projectDescription',
    ]
    required.forEach((field) => {
        if (!String(data[field] ?? '').trim()) errors[field] = "can't be empty"
    })
    if (data.clientEmail && !EMAIL_RE.test(data.clientEmail.trim())) {
        errors.clientEmail = 'invalid email'
    }
    const itemErrors = []
    let hasItemError = false
    ;(data.items || []).forEach((item, idx) => {
        const ie = {}
        if (!String(item.name ?? '').trim()) ie.name = "can't be empty"
        if (!(Number(item.quantity) > 0)) ie.quantity = 'must be > 0'
        if (!(Number(item.price) >= 0) || Number.isNaN(Number(item.price))) ie.price = 'invalid'
        if (Object.keys(ie).length) hasItemError = true
        itemErrors[idx] = ie
    })
    if (!data.items || data.items.length === 0) {
        errors.items = '- An item must be added'
    } else if (hasItemError) {
        errors.items = '- All fields must be added'
    }
    errors._items = itemErrors
    return errors
}

function hasBlockingErrors(errors) {
    return Object.keys(errors).some((k) => k !== '_items' && errors[k])
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
    const [errors, setErrors] = useState({ _items: [] })
    const isExistingDraft = Boolean(invoiceId) && initialData?.status === 'draft'
    const isPaid = initialData?.status === 'paid'

    function clearError(name) {
        setErrors((prev) => {
            if (!prev[name]) return prev
            const next = { ...prev }
            delete next[name]
            return next
        })
    }
    function handleChange(e) {
        const { name, value } = e.target
        setFormData((prevdata) => ({ ...prevdata, [name]: value }))
        clearError(name)
    }
    function handleItemChange(index, field, value) {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }))
        setErrors((prev) => {
            const itemsErr = [...(prev._items || [])]
            if (itemsErr[index] && itemsErr[index][field]) {
                itemsErr[index] = { ...itemsErr[index] }
                delete itemsErr[index][field]
            }
            const next = { ...prev, _items: itemsErr }
            delete next.items
            return next
        })
    }
    function handleAddItem() {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: 1, price: '0.00' }],
        }))
        setErrors((prev) => {
            const next = { ...prev }
            delete next.items
            return next
        })
    }
    function handleRemoveItem(index) {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }))
        setErrors((prev) => ({
            ...prev,
            _items: (prev._items || []).filter((_, i) => i !== index),
        }))
    }

    function persist(status) {
        const amount = computeAmount(formData.items)
        const dueDate = computeDueDate(formData.invoiceDate, formData.paymentTerms)
        if (invoiceId) {
            updateInvoice(invoiceId, {
                ...formData,
                name: formData.clientName,
                dueDate,
                amount,
                status,
            })
        } else {
            addInvoice({
                ...formData,
                invoiceId: generateInvoiceId(),
                name: formData.clientName,
                dueDate,
                amount,
                status,
            })
        }
        onSaved?.()
    }

    function handleSaveDraft() {
        if (isPaid) return
        persist(isExistingDraft || !invoiceId ? 'draft' : (initialData?.status || 'draft'))
    }
    function handleSubmit(e) {
        e.preventDefault()
        if (isPaid) return
        const validation = validateForSend(formData)
        setErrors(validation)
        if (hasBlockingErrors(validation)) return
        persist('pending')
    }
    function fieldProps(name) {
        return {
            id: name,
            name,
            value: formData[name] ?? '',
            onChange: handleChange,
            'aria-invalid': errors[name] ? true : undefined,
            'aria-describedby': errors[name] ? `${name}-error` : undefined,
            className: errors[name] ? 'input--error' : undefined,
        }
    }
    function renderFieldError(name) {
        if (!errors[name]) return null
        return <span className="form__error" id={`${name}-error`}>{errors[name]}</span>
    }
    return (
        <div className="form__container">
            <h2 className="form__action">{action}{invoiceId ? <> <span className="hash">#</span>{invoiceId}</> : ''}</h2>
            <form onSubmit={handleSubmit} className="form" noValidate>
                <div className="bill__from">
                    <h3 className="form__section-heading">Bill From</h3>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="streetAddress">Street Address</label>
                            {renderFieldError('streetAddress')}
                        </div>
                        <input type="text" {...fieldProps('streetAddress')} />
                    </div>
                    <div className="form__row grouped__input">
                        <div>
                            <div className="form__row-head">
                                <label htmlFor="city">City</label>
                                {renderFieldError('city')}
                            </div>
                            <input type="text" {...fieldProps('city')} />
                        </div>
                        <div>
                            <div className="form__row-head">
                                <label htmlFor="postCode">Post Code</label>
                                {renderFieldError('postCode')}
                            </div>
                            <input type="text" {...fieldProps('postCode')} />
                        </div>
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="country">Country</label>
                            {renderFieldError('country')}
                        </div>
                        <input type="text" {...fieldProps('country')} />
                    </div>
                </div>
                <div className="bill__to">
                    <h3 className="form__section-heading">Bill To</h3>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="clientName">Client Name</label>
                            {renderFieldError('clientName')}
                        </div>
                        <input type="text" {...fieldProps('clientName')} />
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="clientEmail">Client Email</label>
                            {renderFieldError('clientEmail')}
                        </div>
                        <input type="email" {...fieldProps('clientEmail')} placeholder="e.g. email@example.com" />
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="clientStreetAddress">Street Address</label>
                            {renderFieldError('clientStreetAddress')}
                        </div>
                        <input type="text" {...fieldProps('clientStreetAddress')} />
                    </div>
                    <div className="form__row grouped__input">
                        <div>
                            <div className="form__row-head">
                                <label htmlFor="clientCity">City</label>
                                {renderFieldError('clientCity')}
                            </div>
                            <input type="text" {...fieldProps('clientCity')} />
                        </div>
                        <div>
                            <div className="form__row-head">
                                <label htmlFor="clientPostCode">Post Code</label>
                                {renderFieldError('clientPostCode')}
                            </div>
                            <input type="text" {...fieldProps('clientPostCode')} />
                        </div>
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="clientCountry">Country</label>
                            {renderFieldError('clientCountry')}
                        </div>
                        <input type="text" {...fieldProps('clientCountry')} />
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="invoiceDate">Invoice Date</label>
                            {renderFieldError('invoiceDate')}
                        </div>
                        <input type="date" {...fieldProps('invoiceDate')} />
                    </div>
                    <div className="form__row">
                        <label htmlFor="paymentTerms">Payment Terms</label>
                        <select id="paymentTerms" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}>
                            <option value="1">Net 1 Day</option>
                            <option value="7">Net 7 Days</option>
                            <option value="14">Net 14 Days</option>
                            <option value="30">Net 30 Days</option>
                        </select>
                    </div>
                    <div className="form__row">
                        <div className="form__row-head">
                            <label htmlFor="projectDescription">Project / Description</label>
                            {renderFieldError('projectDescription')}
                        </div>
                        <input type="text" {...fieldProps('projectDescription')} />
                    </div>
                </div>
                <div className="form__items">
                    <h3 className="form__items-heading">Item List</h3>
                    {formData.items.map((item, idx) => {
                        const ie = (errors._items && errors._items[idx]) || {}
                        return (
                            <div key={idx} className="form__item">
                                <div className="form__row">
                                    <label htmlFor={`item-name-${idx}`}>Item Name</label>
                                    <input id={`item-name-${idx}`} type="text" value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} aria-invalid={ie.name ? true : undefined} className={ie.name ? 'input--error' : undefined} />
                                </div>
                                <div className="form__row grouped__input form__item-row">
                                    <div>
                                        <label htmlFor={`item-qty-${idx}`}>Qty</label>
                                        <input id={`item-qty-${idx}`} type="number" min="0" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} aria-invalid={ie.quantity ? true : undefined} className={ie.quantity ? 'input--error' : undefined} />
                                    </div>
                                    <div>
                                        <label htmlFor={`item-price-${idx}`}>Price</label>
                                        <input id={`item-price-${idx}`} type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} aria-invalid={ie.price ? true : undefined} className={ie.price ? 'input--error' : undefined} />
                                    </div>
                                    <div>
                                        <span className="form__col-label">Total</span>
                                        <p className="form__item-total">{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</p>
                                    </div>
                                    <button type="button" className="form__item-remove" onClick={() => handleRemoveItem(idx)} aria-label={`Remove item ${idx + 1}`}>🗑</button>
                                </div>
                            </div>
                        )
                    })}
                    <button type="button" className="form__add-item" onClick={handleAddItem}>+ Add New Item</button>
                    {errors.items && <p className="form__error form__error--block" role="alert">{errors.items}</p>}
                </div>
                <div className="form__actions">
                    <button type="button" className="form__cancel" onClick={onCancel}>{invoiceId ? 'Cancel' : 'Discard'}</button>
                    {!isPaid && (isExistingDraft || !invoiceId) && (
                        <button type="button" className="form__draft" onClick={handleSaveDraft}>Save as Draft</button>
                    )}
                    {!isPaid && (
                        <button type="submit" className="form__save">{invoiceId ? 'Save Changes' : 'Save & Send'}</button>
                    )}
                </div>
            </form>
        </div>
    )
}
export default Form
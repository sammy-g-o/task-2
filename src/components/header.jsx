import { useEffect, useState } from "react"

function getInitialTheme() {
    if (typeof document !== 'undefined') {
        const attr = document.documentElement.getAttribute('data-theme')
        if (attr === 'dark' || attr === 'light') return attr
    }
    return 'light'
}

function Header() {
    const [theme, setTheme] = useState(getInitialTheme)
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
    }, [theme])
    function toggleTheme() {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    }
    const isDark = theme === 'dark'
    return (
        <div className="Header">
            <div className="logo-container">
                <img src="/icons/chipped-oval.svg" alt="" />
            </div>
            <div className="Header__right-corner">
                <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {isDark ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10 14a4 4 0 100-8 4 4 0 000 8zM10 0a1 1 0 011 1v2a1 1 0 11-2 0V1a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10-7a1 1 0 010 2h-2a1 1 0 110-2h2zM3 9a1 1 0 010 2H1a1 1 0 110-2h2zm14.071-6.071a1 1 0 010 1.414L15.66 5.754a1 1 0 11-1.415-1.414l1.414-1.414a1 1 0 011.414 0zM5.754 14.246a1 1 0 010 1.414L4.34 17.071a1 1 0 11-1.414-1.414l1.414-1.414a1 1 0 011.414 0zm11.317 2.825a1 1 0 01-1.414 0L14.246 15.66a1 1 0 011.414-1.415l1.414 1.414a1 1 0 010 1.415zM5.754 5.754a1 1 0 01-1.414 0L2.929 4.34a1 1 0 011.414-1.414L5.754 4.34a1 1 0 010 1.414z" fill="currentColor" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.502 11.342a.703.703 0 00-.588.128 7.499 7.499 0 01-2.275 1.33 7.123 7.123 0 01-2.581.46A7.516 7.516 0 018.74 11.06a7.516 7.516 0 01-2.198-5.316c0-.87.153-1.713.41-2.5.28-.817.69-1.583 1.226-2.27a.711.711 0 00-.102-.997.706.706 0 00-.665-.128C5.09.972 3.197 2.451 1.844 4.34A10.314 10.314 0 000 10.32c0 2.84 1.151 5.421 3.014 7.284a10.28 10.28 0 007.285 3.014c2.298 0 4.42-.715 6.18-1.94a10.397 10.397 0 003.81-5.114.703.703 0 00-.787-.928z" fill="currentColor" />
                        </svg>
                    )}
                </button>
                <div className="avatar"><img src="/avatar.png" alt="" width="32" height="32" /></div>
            </div>
        </div>
    )
}
export default Header
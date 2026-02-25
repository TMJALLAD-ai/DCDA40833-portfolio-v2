document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'portfolio-theme';
    const root = document.documentElement;
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const getPreferredTheme = () => (prefersDark.matches ? 'dark' : 'light');

    const getStoredTheme = () => {
        try {
            const storedTheme = localStorage.getItem(STORAGE_KEY);
            return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
        } catch {
            return null;
        }
    };

    const updateToggleUi = (theme) => {
        const isDark = theme === 'dark';
        themeToggles.forEach((toggle) => {
            toggle.setAttribute('aria-pressed', String(isDark));
            toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

            const icon = toggle.querySelector('.theme-toggle-icon');
            const text = toggle.querySelector('.theme-toggle-text');

            if (icon) {
                icon.textContent = isDark ? '☀️' : '🌙';
            }
                                // I understand that above and below are the key components of the UI update of the toggle dark mode button. I understand some of the if statements but would not be sure how to write this code entirely myself.
            if (text) {
                text.textContent = isDark ? 'Light mode' : 'Dark mode';
            }
        });
    };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        updateToggleUi(theme);
    };

    const setTheme = (theme) => {
        applyTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore storage failures in restricted environments.
        }
    };

    const activeTheme = getStoredTheme() || getPreferredTheme();
    applyTheme(activeTheme);

    themeToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);
        });
    });

    prefersDark.addEventListener('change', () => {
        if (!getStoredTheme()) {
            applyTheme(getPreferredTheme());
        }
    });

    const navs = document.querySelectorAll('nav[data-nav]');

    navs.forEach((nav) => {
        const toggle = nav.querySelector('.nav-toggle');
        const menu = nav.querySelector('ul');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('nav-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                nav.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
});

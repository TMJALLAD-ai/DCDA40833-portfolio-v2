document.addEventListener('DOMContentLoaded', () => {
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

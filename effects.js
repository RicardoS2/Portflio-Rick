// effects.js - CARROSSEL DE TECHS (usa Font Awesome)
document.addEventListener('DOMContentLoaded', () => {
    const techs = [
        { name: 'HTML', iconClass: 'fa-brands fa-html5' },
        { name: 'CSS', iconClass: 'fa-brands fa-css3-alt' },
        { name: 'JavaScript', iconClass: 'fa-brands fa-js' },
        { name: 'PHP', iconClass: 'fa-brands fa-php' },
        { name: 'Tailwind', iconClass: 'fa-solid fa-wind' }, // CORRIGIDO
        { name: 'Laravel', iconClass: 'fa-brands fa-laravel' },
        { name: 'Python', iconClass: 'fa-brands fa-python' },
        { name: 'Git', iconClass: 'fa-brands fa-git' },
        { name: 'GitHub', iconClass: 'fa-brands fa-github' },
    ];

    const root = document.getElementById('tech-carousel');
    if (!root) return;

    // cria track
    const track = document.createElement('div');
    track.className = 'tech-track';
    // popula
    techs.forEach((t) => {
        const item = document.createElement('div');
        item.className = 'tech-item';
        item.setAttribute('role', 'group');
        item.setAttribute('aria-label', t.name);

        const i = document.createElement('i');
        i.className = `icon ${t.iconClass}`;
        i.setAttribute('aria-hidden', 'true');

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = t.name;

        item.appendChild(i);
        item.appendChild(label);
        track.appendChild(item);
    });

    // duplicate track for seamless marquee
    const trackClone = track.cloneNode(true);
    trackClone.classList.add('duplicate');

    // wrapper: will contain both tracks side by side
    const wrapper = document.createElement('div');
    wrapper.className = 'tech-track-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.width = 'max-content';
    wrapper.appendChild(track);
    wrapper.appendChild(trackClone);

    // place wrapper inside a container (trackHolder) that will be animated
    const trackHolder = document.createElement('div');
    trackHolder.className = 'tech-track-holder';
    trackHolder.style.display = 'flex';
    trackHolder.appendChild(wrapper);

    // clear root and append holder
    root.innerHTML = '';
    root.appendChild(trackHolder);

    // after paint, compute widths and enable marquee animation by adding class
    requestAnimationFrame(() => {
        // duplicate must have same width; CSS animation moves -50%
        const trackWidth = track.getBoundingClientRect().width;
        if (trackWidth === 0) return; // nothing to do

        // set min-width of holders to prevent wrapping on small screens
        wrapper.style.minWidth = `${trackWidth * 2}px`;

        // add class to start CSS marquee animation
        // we add to the track (not wrapper) to match CSS rule .tech-track.marquee
        const allTracks = root.querySelectorAll('.tech-track');
        allTracks.forEach((t) => t.classList.add('marquee'));
    });

    // pause on hover (accessible)
    root.addEventListener('mouseenter', () => {
        document
            .querySelectorAll('.tech-track.marquee')
            .forEach((t) => (t.style.animationPlayState = 'paused'));
    });
    root.addEventListener('mouseleave', () => {
        document
            .querySelectorAll('.tech-track.marquee')
            .forEach((t) => (t.style.animationPlayState = 'running'));
    });

    // keyboard navigation: focus first item, support left/right arrows
    const firstItem = root.querySelector('.tech-item');
    if (firstItem) {
        firstItem.setAttribute('tabindex', '0');
        root.addEventListener('keydown', (e) => {
            const focused = document.activeElement;
            if (!focused || !focused.classList.contains('tech-item')) return;
            if (e.key === 'ArrowRight') {
                const next =
                    focused.nextElementSibling ||
                    focused.parentElement.firstElementChild;
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft') {
                const prev =
                    focused.previousElementSibling ||
                    focused.parentElement.lastElementChild;
                if (prev) prev.focus();
            }
        });
    }
});

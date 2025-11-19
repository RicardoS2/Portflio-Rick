const techs = [
    { name: 'HTML', iconClass: 'fa-brands fa-html5' },
    { name: 'CSS', iconClass: 'fa-brands fa-css3-alt' },
    { name: 'JavaScript', iconClass: 'fa-brands fa-js' },
    { name: 'PHP', iconClass: 'fa-brands fa-php' },
    { name: 'Tailwind', iconClass: 'fa-solid fa-wind' },
    { name: 'Laravel', iconClass: 'fa-brands fa-laravel' },
    { name: 'Python', iconClass: 'fa-brands fa-python' },
    { name: 'Git', iconClass: 'fa-brands fa-git' },
    { name: 'GitHub', iconClass: 'fa-brands fa-github' },
];

const techCarouselRoot = document.getElementById('tech-carousel');

const createTechItem = (t) => {
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
    return item;
};

window.setupTechMarquee = function () {
    if (!techCarouselRoot || techs.length === 0) return;

    techCarouselRoot.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'tech-track';
    techs.forEach((t) => track.appendChild(createTechItem(t)));

    const trackClone = track.cloneNode(true);
    trackClone.classList.add('duplicate');

    const wrapper = document.createElement('div');
    wrapper.className = 'tech-track-wrapper';
    wrapper.appendChild(track);
    wrapper.appendChild(trackClone);

    const trackHolder = document.createElement('div');
    trackHolder.className = 'tech-track-holder';
    trackHolder.appendChild(wrapper);

    techCarouselRoot.appendChild(trackHolder);

    requestAnimationFrame(() => {
        const trackWidth = track.getBoundingClientRect().width;
        if (trackWidth > 0) {
            trackHolder.style.setProperty('--track-width', `-${trackWidth}px`);
            trackHolder.classList.add('marquee');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.setupTechMarquee();
});

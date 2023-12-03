let activated: boolean = false;
let element: HTMLDivElement | null = null;
let focusedElement: Element | null = null;
let startingX: number = 0;
let startingY: number = 0;
let currentX: number = 0;
let currentY: number = 0;

function toggle(e: MouseEvent) {
    activated = !activated;
    if (activated) {
        focusedElement = searchForScrollableElement(e.target as HTMLElement);
        onEnable();
    } else {
        focusedElement = null;
        onDisable();
    }
}

function easeScroll(x: number) {
    return 1 - Math.pow(1 - x, 3);
}

let lastTime: number | null = null;
function scrollLoop(delta: number) {
    if (!activated) return;
    
    
    if (!lastTime) lastTime = Date.now();
    const time = Date.now();
    const deltaTime = time - lastTime;
    lastTime = time;

    const dx = startingX - currentX;
    const dy = startingY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 0.05 * easeScroll(distance / 1000) * deltaTime;
    const scrollX = dx * speed * -1;
    const scrollY = dy * speed * -1;

    if (!focusedElement) focusedElement = document.documentElement;
    focusedElement.scrollBy(scrollX, scrollY);

    requestAnimationFrame(scrollLoop);
}

function onMouseMove(ev: MouseEvent) {
    currentX = ev.clientX;
    currentY = ev.clientY;
    const direction = getDirection();
    document.body.style.cursor = getCursorIcon(direction);
}

function onEnable() {
    element = document.createElement("div");
    element.innerHTML = createElement({ x: startingX, y: startingY });
    document.body.appendChild(element);

    window.addEventListener("mousemove", onMouseMove);
    requestAnimationFrame(scrollLoop);
}

function createElement({ x = 0, y = 0 }): string {
    return `<div style="position:fixed;z-index:9999999;top:${y-15}px;left:${x-15}px;opacity:0.8"><img src=${chrome.runtime.getURL("images/middleclick.png")} style="filter:none;border:2px solid #3f3f3f;border-radius:99999px" /></div>`;
}

function onDisable() {
    document.body.style.cursor = "";
    if (element) document.body.removeChild(element);

    window.removeEventListener("mousemove", onMouseMove);
    startingX = 0;
    startingY = 0;
    currentX = 0;
    currentY = 0;
    lastTime = null;
    element = null;
    focusedElement = null;
}

function onWheelClick(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();

    currentX = ev.clientX;
    currentY = ev.clientY;
    startingX = ev.clientX;
    startingY = ev.clientY;

    toggle(ev);
}

let clickTime: number | null = null;
window.addEventListener("mousedown", (ev) => {
    if (ev.button !== 1) {
        if (activated) {
            toggle(ev);
        }

        return;
    }

    clickTime = Date.now();
    onWheelClick(ev);
})

window.addEventListener("mouseup", (ev) => {
    if (ev.button !== 1) return;

    const time = Date.now();
    if (clickTime && time - clickTime > 350) {
        onWheelClick(ev);
    }
});

// Utils
const directions = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"] as const;
type Direction = typeof directions[number];

function getCursorIcon(direction: Direction): string {
    return direction.toLowerCase() + "-resize";
}

function getDirection(): Direction  {
    const dx = startingX - currentX;
    const dy = startingY - currentY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const index = Math.round(angle / 45) + 4;
    return directions[index % directions.length];
}

function searchForScrollableElement(start: HTMLElement): Element | null {
    if (start == null) {
        return document.scrollingElement || document.documentElement;
    }

    const isScrollableY = start.scrollHeight > start.clientHeight
        && window.getComputedStyle(start).overflowY === "scroll" 
        && window.getComputedStyle(start).overflowY === "auto";

    const isScrollableX = start.scrollWidth > start.clientWidth 
        && window.getComputedStyle(start).overflowX === "scroll" 
        && window.getComputedStyle(start).overflowX === "auto";

    if (isScrollableY || isScrollableX) {
        return start;
    }

    if (start.parentElement == null) {
        return window.document.documentElement;
    }

    return searchForScrollableElement(start.parentElement);
}
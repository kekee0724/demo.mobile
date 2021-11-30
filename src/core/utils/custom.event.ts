function emit<T = any>(typeArg: string, data?: T, target: EventTarget = window) {
    return target.dispatchEvent(new CustomEvent(typeArg, { detail: data, cancelable: true, bubbles: false }));
}

function on(typeArg: string, listener: EventListenerOrEventListenerObject | null, target: EventTarget = window) {
    typeArg.split(/\s/).forEach(typeArg => target.addEventListener(typeArg, listener, false));

    return () => {
        off(typeArg, listener, target);
    };
}

function off(typeArg: string, listener: EventListenerOrEventListenerObject | null, target: EventTarget = window) {
    typeArg.split(/\s/).forEach(typeArg => target.removeEventListener(typeArg, listener, false));

    return customEvent;
}

function once(typeArg: string, listener: EventListenerOrEventListenerObject | null, target: EventTarget = window) {
    typeArg.split(/\s/).forEach(typeArg => target.addEventListener(typeArg, listener, { capture: false, once: true }));

    return customEvent;
}

export const customEvent = { emit, on, off, once };

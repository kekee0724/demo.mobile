import React from "react";

export function RouteLazyWaiting(Component: any, fallback: React.ReactNode) {
    return (props) => (
        <React.Suspense fallback={fallback!}>
            <Component {...props} />
        </React.Suspense>
    );
}

let quantity = 0;

export function createLoadLazyModule<T extends React.ComponentType<any>>(fallback: React.ReactNode) {
    return (factory: () => Promise<{ routes: T }>) => {
        let promise: Promise<{ routes: T }>;

        const time = setTimeout(() => (promise = factory()), 8000 + 3000 * quantity++);

        return RouteLazyWaiting(
            React.lazy(() => (promise || (clearTimeout(time), factory())).then(({ routes }) => ({ default: routes }))),
            fallback
        );
    };
}

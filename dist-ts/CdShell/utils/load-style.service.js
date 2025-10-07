// utils/load-style.ts
export function loadStyle(href) {
    return new Promise((resolve, reject) => {
        // Avoid duplicate loads
        if (document.querySelector(`link[href="${href}"]`)) {
            return resolve();
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
        document.head.appendChild(link);
    });
}

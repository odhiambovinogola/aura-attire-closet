export type ToastVariant = "success" | "error";

interface ToastOptions {
  subtitle?: string;
  variant?: ToastVariant;
  duration?: number;
}

function ensureContainer(): HTMLElement {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6";
    document.body.appendChild(container);
  }
  return container;
}

const ICONS: Record<ToastVariant, string> = {
  success:
    '<svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.143a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>',
  error:
    '<svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.514 2.63H3.72c-1.345 0-2.187-1.463-1.514-2.63L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>',
};

const PALETTE: Record<ToastVariant, string> = {
  success: "bg-ink text-cream",
  error: "bg-[#5c1f16] text-cream",
};

export function showToast(title: string, options: ToastOptions = {}) {
  const { subtitle, variant = "success", duration = 3500 } = options;
  const container = ensureContainer();

  const toast = document.createElement("div");
  toast.className = `animate-fade-up flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg ${PALETTE[variant]}`;
  toast.innerHTML = `
    ${ICONS[variant]}
    <div class="text-sm">
      <p class="font-medium">${title}</p>
      ${subtitle ? `<p class="mt-0.5 text-cream/80">${subtitle}</p>` : ""}
    </div>
  `;

  container.appendChild(toast);
  window.setTimeout(() => {
    toast.classList.add("opacity-0", "transition-opacity", "duration-300");
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}

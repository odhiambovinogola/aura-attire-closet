interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const { title, body, confirmLabel = "Confirm", danger = false } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4";

    const card = document.createElement("div");
    card.className = "w-full max-w-sm rounded-lg bg-cream p-6 shadow-xl";
    card.innerHTML = `
      <p class="font-[family-name:var(--font-display)] text-lg font-semibold">${title}</p>
      ${body ? `<p class="mt-2 text-sm text-taupe">${body}</p>` : ""}
      <div class="mt-6 flex gap-3">
        <button type="button" data-action="cancel" class="w-1/2 rounded-sm border border-gold-light px-4 py-2 text-sm font-semibold hover:bg-blush">
          Cancel
        </button>
        <button type="button" data-action="confirm" class="w-1/2 rounded-sm px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-[#5c1f16] hover:bg-[#481810]" : "bg-gold hover:bg-gold-dark"}">
          ${confirmLabel}
        </button>
      </div>
    `;

    function close(result: boolean) {
      overlay.remove();
      resolve(result);
    }

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(false);
    });
    card.querySelector('[data-action="cancel"]')?.addEventListener("click", () => close(false));
    card.querySelector('[data-action="confirm"]')?.addEventListener("click", () => close(true));

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  });
}

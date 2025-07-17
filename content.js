function injectMenuItems() {
  chrome.storage.sync.get(["customItems", "hiddenItems"], ({ customItems = [], hiddenItems = [] }) => {
    const menu = document.querySelector(".menu_links");
    if (!menu) return;

    console.log("[JOYclub Injector] Custom Items:", customItems);
    console.log("[JOYclub Injector] Hidden Items:", hiddenItems);

    // Hide specified original items
    hiddenItems.forEach(text => {
      const item = Array.from(menu.children).find(li => li.textContent.includes(text));
      if (item) {
        console.log(`[JOYclub Injector] Hiding menu item: ${text}`);
        item.style.display = "none";
      }
    });

    // Inject custom menu items
    customItems.forEach((item, index) => {
      console.log(`[JOYclub Injector] Adding custom item: ${item.label} @${item.position}`);
      const li = document.createElement("li");
      li.className = "menu_link";
      li.title = item.label;
      li.innerHTML = `<a href="${item.url}"><span class="item_text">${item.label}</span></a>`;

      if (item.position >= 0 && item.position < menu.children.length) {
        menu.insertBefore(li, menu.children[item.position]);
      } else {
        menu.appendChild(li);
      }
    });
  });
}

const intervalId = setInterval(() => {
  const menu = document.querySelector(".menu_links");
  if (menu) {
    clearInterval(intervalId);
    injectMenuItems();
  }
}, 100);

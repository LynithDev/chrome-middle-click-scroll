const scroll_speed_input = document.getElementById("scroll_speed") as HTMLInputElement;
const custom_cursor_input = document.getElementById("custom_cursor") as HTMLInputElement;

chrome.storage.local.get("scroll_speed", (data) => {
    scroll_speed_input.value = String(data.scroll_speed);
});

chrome.storage.local.get("custom_cursor", (data) => {
    console.log(data);
    custom_cursor_input.checked = data.custom_cursor;
});

scroll_speed_input.addEventListener("change", () => {
    const scroll_speed = Number(scroll_speed_input.value);
    chrome.storage.local.set({ scroll_speed });
});

custom_cursor_input.addEventListener("change", () => {
    const custom_cursor = custom_cursor_input.checked;
    chrome.storage.local.set({ custom_cursor });
});
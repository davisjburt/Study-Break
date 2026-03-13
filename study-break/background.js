const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ timerRunning: false, onBreak: false });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_TIMER") {
    chrome.alarms.create("focusEnd", { delayInMinutes: FOCUS_MINUTES });
    chrome.storage.local.set({ timerRunning: true, onBreak: false });
  }

  if (msg.type === "END_BREAK") {
    chrome.alarms.create("focusEnd", { delayInMinutes: FOCUS_MINUTES });
    chrome.storage.local.set({ onBreak: false });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusEnd") {
    chrome.storage.local.set({ onBreak: true });
    // Notify all Canvas tabs to pop open the game dock
    chrome.tabs.query({ url: "https://*.instructure.com/*" }, (tabs) => {
      tabs.forEach((tab) =>
        chrome.tabs.sendMessage(tab.id, { type: "BREAK_TIME" }),
      );
    });
  }
});

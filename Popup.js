// async function sendToContent(type){
//   const statusEl = document.getElementById('status');
//   statusEl.innerText = 'Saving...';
//   try {
//     const [tab] = await chrome.tabs.query({active:true, currentWindow:true});

//     // Try to send message
//     await chrome.tabs.sendMessage(tab.id, {type});
//     statusEl.innerText = 'Download started! Check Downloads folder';

//   } catch(e){
//     console.log('Content script not ready, injecting...', e);
//     // Content script not injected, inject it now
//     const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
//     try {
//       await chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         files: ['content.js']
//       });
//       // Try again after injection
//       setTimeout(async ()=>{
//         try {
//           await chrome.tabs.sendMessage(tab.id, {type});
//           statusEl.innerText = 'Download started! Check Downloads folder';
//         } catch(e2){
//           statusEl.innerText = 'Please refresh the page and try again';
//         }
//       }, 500);
//     } catch(err){
//       statusEl.innerText = 'Please refresh the Meta AI/ChatGPT page and try again';
//     }
//   }
// }

// document.getElementById('saveMd').onclick = () => sendToContent('SAVE_MD');
// document.getElementById('saveJson').onclick = () => sendToContent('SAVE_JSON');

// chrome.runtime.onMessage.addListener((msg)=>{
//   if(msg.status) document.getElementById('status').innerText = msg.status;
// });

async function sendToContent(type) {
  const statusEl = document.getElementById("status");
  statusEl.innerText = "Saving...";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.tabs.sendMessage(tab.id, { type });
    statusEl.innerText = "Download started! Check Downloads";
  } catch (e) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id, { type });
        statusEl.innerText = "Download started!";
      } catch {
        statusEl.innerText = "Please refresh ChatGPT page";
      }
    }, 600);
  }
}
document.getElementById("saveMd").onclick = () => sendToContent("SAVE_MD");
document.getElementById("saveHtml").onclick = () => sendToContent("SAVE_HTML");

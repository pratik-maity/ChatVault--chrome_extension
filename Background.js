// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if(msg.type==="DOWNLOAD"){
//     // Service worker fix: use data URI, NOT blob
//     const mime = msg.filename.endsWith('.json') ? 'application/json' : 'text/markdown';
//     const dataUri = `data:${mime};charset=utf-8,` + encodeURIComponent(msg.content);

//     chrome.downloads.download({
//       url: dataUri,
//       filename: msg.filename,
//       saveAs: false
//     });
//   }
//   return true;
// });

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "DOWNLOAD") {
    const mime = msg.filename.endsWith(".html") ? "text/html" : "text/markdown";
    const dataUri =
      `data:${mime};charset=utf-8,` + encodeURIComponent(msg.content);
    chrome.downloads.download({ url: dataUri, filename: msg.filename });
  }
  return true;
});

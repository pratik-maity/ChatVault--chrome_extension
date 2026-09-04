// console.log("ChatVault loaded");
// function getChatGPTMessages(){
//   const nodes = document.querySelectorAll('[data-message-author-role]');
//   return Array.from(nodes).map(n=>{
//     const role = n.getAttribute('data-message-author-role');
//     const clone = n.cloneNode(true);
//     return {role: role==='user'?'You':'AI', html: clone.innerHTML, text: clone.innerText}
//   })
// }
// function getMetaAIMessages(){
//   let nodes = document.querySelectorAll('div[data-message-author-role], article');
//   if(nodes.length < 3){
//     const main = document.querySelector('main');
//     if(main){
//       // Meta AI has long conversation list
//       nodes = main.querySelectorAll('div');
//     }
//   }
//   // Filter meaningful bubbles
//   const filtered = Array.from(nodes).filter(n=>{
//     const t = n.innerText?.trim() || '';
//     return t.length > 25 && t.length < 8000 && n.querySelectorAll('div').length < 10;
//   });
//   // dedup and keep last 100
//   const uniq = [];
//   const seen = new Set();
//   for(const n of filtered){
//     if(!seen.has(n.innerText.slice(0,100))){
//       seen.add(n.innerText.slice(0,100));
//       uniq.push({role:'Message', html: n.innerHTML, text: n.innerText});
//     }
//   }
//   return uniq.slice(-80);
// }
// function extractConversation(){
//   if(location.hostname.includes('meta.ai')){
//     return getMetaAIMessages();
//   } else {
//     return getChatGPTMessages();
//   }
// }
// function toMarkdown(messages){
//   let md = `# ChatVault Export - ${new Date().toLocaleString()}\n\n`;
//   messages.forEach(m=>{
//     md += `## ${m.role}\n`;
//     const temp = document.createElement('div');
//     temp.innerHTML = m.html;
//     temp.querySelectorAll('pre').forEach(pre=>{
//       const code = pre.innerText;
//       const newNode = document.createTextNode('\n```\n'+code+'\n```\n');
//       pre.parentNode.replaceChild(newNode, pre);
//     });
//     md += temp.innerText + '\n\n---\n\n';
//   });
//   return md;
// }
// function download(filename, content){
//   // Send content to background to create blob with correct extension
//   chrome.runtime.sendMessage({type:'DOWNLOAD', filename: filename, content: content});
// }

// function initButton(){
//   if(document.getElementById('chatvault-btn')) return;
//   const btn = document.createElement('button');
//   btn.id='chatvault-btn';
//   btn.innerText='⬇ Save Chat';
//   btn.onclick = ()=>{
//     const msgs = extractConversation();
//     if(msgs.length===0){alert('No messages found, scroll up a bit');return;}
//     const md = toMarkdown(msgs);
//     download(`chatvault-${Date.now()}.md`, md);
//     chrome.storage.local.get({chats:[]}, (res)=>{
//       const chats = res.chats;
//       chats.push({date: Date.now(), url: location.href, preview: msgs[0]?.text.slice(0,80), md});
//       chrome.storage.local.set({chats});
//     });
//   };
//   document.body.appendChild(btn);
// }
// setInterval(initButton, 2000);

// chrome.runtime.onMessage.addListener((msg)=>{
//   if(msg.type==='SAVE_MD'){
//     const msgs = extractConversation();
//     const md = toMarkdown(msgs);
//     download(`chatvault-${Date.now()}.md`, md);
//   }
//   if(msg.type==='SAVE_JSON'){
//     const msgs = extractConversation();
//     download(`chatvault-${Date.now()}.json`, JSON.stringify(msgs, null, 2));
//   }
// })

// console.log("ChatVault v2 loaded - ChatGPT only");

// function getChatGPTMessages() {
//   const nodes = document.querySelectorAll("[data-message-author-role]");
//   return Array.from(nodes).map((n) => {
//     const role = n.getAttribute("data-message-author-role");
//     // The actual content is inside.markdown or prose
//     const contentRoot =
//       n.querySelector('.markdown, [class*="markdown"],.prose') || n;
//     return { role: role === "user" ? "You" : "ChatGPT", root: contentRoot };
//   });
// }

// function convertTable(tableEl) {
//   const rows = Array.from(tableEl.querySelectorAll("tr"));
//   if (rows.length === 0) return "";
//   let md = "\n";
//   rows.forEach((tr, rowIndex) => {
//     const cells = Array.from(tr.querySelectorAll("th, td")).map((cell) => {
//       // Clean cell text, escape pipe
//       return cell.innerText.replace(/\n/g, " ").replace(/\|/g, "\\|").trim();
//     });
//     if (cells.length === 0) return;
//     md += "| " + cells.join(" | ") + " |\n";
//     // Add separator after first row (header)
//     if (rowIndex === 0) {
//       md += "| " + cells.map(() => "---").join(" | ") + " |\n";
//     }
//   });
//   return md + "\n";
// }

// function nodeToMarkdown(node, listState = null) {
//   if (node.nodeType === Node.TEXT_NODE) {
//     return node.textContent;
//   }
//   if (node.nodeType !== Node.ELEMENT_NODE) return "";

//   const tag = node.tagName.toLowerCase();
//   const childrenMd = Array.from(node.childNodes)
//     .map((c) => nodeToMarkdown(c, listState))
//     .join("");

//   switch (tag) {
//     case "h1":
//       return `\n# ${childrenMd.trim()}\n\n`;
//     case "h2":
//       return `\n## ${childrenMd.trim()}\n\n`;
//     case "h3":
//       return `\n### ${childrenMd.trim()}\n\n`;
//     case "h4":
//       return `\n#### ${childrenMd.trim()}\n\n`;
//     case "strong":
//     case "b":
//       return `**${childrenMd}**`;
//     case "em":
//     case "i":
//       return `*${childrenMd}*`;
//     case "s":
//     case "strike":
//     case "del":
//       return `~~${childrenMd}~~`;
//     case "code":
//       // If parent is pre, this will be handled by pre case
//       if (
//         node.parentElement &&
//         node.parentElement.tagName.toLowerCase() === "pre"
//       ) {
//         return node.textContent;
//       }
//       return `\`${node.textContent}\``;
//     case "pre": {
//       // Try to get language
//       const codeEl = node.querySelector("code");
//       let lang = "";
//       if (codeEl) {
//         const cls = codeEl.className || "";
//         const match = cls.match(/language-(\w+)/);
//         if (match) lang = match[1];
//       }
//       const codeText = node.innerText; // keeps newlines
//       return `\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
//     }
//     case "table":
//       return convertTable(node);
//     case "ul": {
//       const items = Array.from(node.children).filter(
//         (c) => c.tagName.toLowerCase() === "li",
//       );
//       return (
//         "\n" +
//         items.map((li) => `- ${nodeToMarkdown(li).trim()}`).join("\n") +
//         "\n\n"
//       );
//     }
//     case "ol": {
//       const items = Array.from(node.children).filter(
//         (c) => c.tagName.toLowerCase() === "li",
//       );
//       return (
//         "\n" +
//         items
//           .map((li, idx) => `${idx + 1}. ${nodeToMarkdown(li).trim()}`)
//           .join("\n") +
//         "\n\n"
//       );
//     }
//     case "li":
//       return childrenMd;
//     case "blockquote": {
//       const lines = childrenMd.trim().split("\n");
//       return "\n" + lines.map((l) => `> ${l}`).join("\n") + "\n\n";
//     }
//     case "a": {
//       const href = node.getAttribute("href") || "";
//       const text = childrenMd.trim();
//       if (!href || href.startsWith("#")) return text;
//       return `[${text}](${href})`;
//     }
//     case "hr":
//       return "\n---\n\n";
//     case "br":
//       return " \n";
//     case "p":
//     case "div": {
//       // Don't double wrap if it's already handled
//       const trimmed = childrenMd.trim();
//       if (!trimmed) return "";
//       // If div contains only table/pre/ul/ol, don't add extra newlines
//       if (node.querySelector && node.querySelector("table, pre, ul, ol"))
//         return childrenMd;
//       return trimmed + "\n\n";
//     }
//     default:
//       return childrenMd;
//   }
// }

// function rootToMarkdown(root) {
//   return nodeToMarkdown(root)
//     .replace(/\n{3,}/g, "\n\n")
//     .trim();
// }

// function toMarkdown(messages) {
//   let md = `# ChatVault Export - ${new Date().toLocaleString()}\n\n`;
//   messages.forEach((m) => {
//     md += `## ${m.role}\n\n`;
//     md += rootToMarkdown(m.root) + "\n\n---\n\n";
//   });
//   return md;
// }

// function download(filename, content) {
//   chrome.runtime.sendMessage({ type: "DOWNLOAD", filename, content });
// }

// function initButton() {
//   if (document.getElementById("chatvault-btn")) return;
//   const btn = document.createElement("button");
//   btn.id = "chatvault-btn";
//   btn.innerText = "⬇ Save Chat";
//   btn.onclick = () => {
//     const msgs = getChatGPTMessages();
//     if (msgs.length === 0) {
//       alert("No messages found");
//       return;
//     }
//     download(`chatvault-${Date.now()}.md`, toMarkdown(msgs));
//   };
//   document.body.appendChild(btn);
// }
// setInterval(initButton, 2000);

// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type === "SAVE_MD") {
//     download(`chatvault-${Date.now()}.md`, toMarkdown(getChatGPTMessages()));
//   }
//   if (msg.type === "SAVE_JSON") {
//     const simple = getChatGPTMessages().map((m) => ({
//       role: m.role,
//       text: m.root.innerText,
//     }));
//     download(`chatvault-${Date.now()}.json`, JSON.stringify(simple, null, 2));
//   }
// });

// console.log("ChatVault v2.1 - ChatGPT only, no floating btn");

// function getMessages() {
//   const nodes = document.querySelectorAll("[data-message-author-role]");
//   return Array.from(nodes).map((n) => {
//     const role = n.getAttribute("data-message-author-role");
//     const root = n.querySelector('.markdown, [class*="markdown"]') || n;
//     return {
//       role: role === "user" ? "You" : "ChatGPT",
//       root: root.cloneNode(true),
//       originalRoot: n.querySelector(".markdown") || n,
//     };
//   });
// }

// function convertTable(tableEl) {
//   const rows = Array.from(tableEl.querySelectorAll("tr"));
//   if (!rows.length) return "";
//   let md = "\n";
//   rows.forEach((tr, i) => {
//     const cells = Array.from(tr.querySelectorAll("th, td")).map((c) =>
//       c.innerText.replace(/\n/g, " ").replace(/\|/g, "\\|").trim(),
//     );
//     if (!cells.length) return;
//     md += "| " + cells.join(" | ") + " |\n";
//     if (i === 0) md += "| " + cells.map(() => "---").join(" | ") + " |\n";
//   });
//   return md + "\n";
// }
// function nodeToMarkdown(node) {
//   if (node.nodeType === 3) return node.textContent;
//   if (node.nodeType !== 1) return "";
//   const tag = node.tagName.toLowerCase();
//   const inner = Array.from(node.childNodes).map(nodeToMarkdown).join("");
//   switch (tag) {
//     case "h1":
//       return `\n# ${inner.trim()}\n\n`;
//     case "h2":
//       return `\n## ${inner.trim()}\n\n`;
//     case "h3":
//       return `\n### ${inner.trim()}\n\n`;
//     case "strong":
//     case "b":
//       return `**${inner}**`;
//     case "em":
//     case "i":
//       return `*${inner}*`;
//     case "s":
//     case "del":
//       return `~~${inner}~~`;
//     case "code":
//       if (node.parentElement?.tagName.toLowerCase() === "pre")
//         return node.textContent;
//       return `\`${node.textContent}\``;
//     case "pre": {
//       const codeEl = node.querySelector("code");
//       let lang = (codeEl?.className.match(/language-(\w+)/) || [])[1] || "";
//       return `\n\`\`\`${lang}\n${node.innerText.trim()}\n\`\`\`\n\n`;
//     }
//     case "table":
//       return convertTable(node);
//     case "ul":
//       return (
//         "\n" +
//         Array.from(node.children)
//           .filter((c) => c.tagName === "LI")
//           .map((li) => `- ${nodeToMarkdown(li).trim()}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "ol":
//       return (
//         "\n" +
//         Array.from(node.children)
//           .filter((c) => c.tagName === "LI")
//           .map((li, i) => `${i + 1}. ${nodeToMarkdown(li).trim()}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "blockquote":
//       return (
//         "\n" +
//         inner
//           .trim()
//           .split("\n")
//           .map((l) => `> ${l}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "a": {
//       const href = node.getAttribute("href") || "";
//       if (!href || href.startsWith("#")) return inner;
//       return `[${inner.trim()}](${href})`;
//     }
//     case "hr":
//       return "\n---\n\n";
//     case "br":
//       return " \n";
//     case "p":
//     case "div": {
//       const t = inner.trim();
//       if (!t) return "";
//       if (node.querySelector("table, pre, ul, ol")) return inner;
//       return t + "\n\n";
//     }
//     default:
//       return inner;
//   }
// }
// function toMarkdown(messages) {
//   let md = `# ChatVault Export - ${new Date().toLocaleString()}\n\n`;
//   messages.forEach((m) => {
//     md +=
//       `## ${m.role}\n\n` +
//       nodeToMarkdown(m.root)
//         .replace(/\n{3,}/g, "\n\n")
//         .trim() +
//       "\n\n---\n\n";
//   });
//   return md;
// }
// function toHTML(messages) {
//   let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ChatVault - ${new Date().toLocaleString()}</title>
// <style>
// body{font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width:800px; margin:0 auto; padding:20px; background:#fff; color:#111; line-height:1.6}
// .message{margin:20px 0; padding:16px; border-radius:12px; border:1px solid #e5e7eb}
// .message.You{background:#f0f7ff; border-color:#bfdbfe}
// .message.ChatGPT{background:#f9fafb}
// .message h3{margin:0 0 8px 0; font-size:14px; opacity:0.6}
// pre{background:#0d1117; color:#e6edf3; padding:16px; border-radius:8px; overflow:auto}
// code{background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:0.9em}
// pre code{background:transparent; padding:0}
// table{border-collapse:collapse; width:100%; margin:12px 0}
// th,td{border:1px solid #d1d5db; padding:8px 12px; text-align:left}
// th{background:#f3f4f6; font-weight:600}
// blockquote{border-left:4px solid #6c5ce7; margin:12px 0; padding:8px 16px; background:#f8f7ff}
// a{color:#6c5ce7}
// @media print{body{padding:0}.message{break-inside:avoid}}
// </style></head><body><h1>ChatVault Export</h1><p><small>${new Date().toLocaleString()} | ${location.href}</small></p>`;
//   messages.forEach((m) => {
//     html += `<div class="message ${m.role}"><h3>${m.role}</h3><div class="content">${m.originalRoot.innerHTML}</div></div>`;
//   });
//   html += `<script>console.log('Print with Ctrl+P to save as PDF')</script></body></html>`;
//   return html;
// }
// function download(name, content) {
//   chrome.runtime.sendMessage({ type: "DOWNLOAD", filename: name, content });
// }

// chrome.runtime.onMessage.addListener((msg) => {
//   const msgs = getMessages();
//   if (msg.type === "SAVE_MD") {
//     download(`chatvault-${Date.now()}.md`, toMarkdown(msgs));
//   }
//   if (msg.type === "SAVE_HTML") {
//     download(`chatvault-${Date.now()}.html`, toHTML(msgs));
//   }
// });

// console.log("ChatVault v2.2 - clean HTML, no maps/images");

// function getMessages() {
//   const nodes = document.querySelectorAll("[data-message-author-role]");
//   return Array.from(nodes)
//     .map((n) => {
//       const role = n.getAttribute("data-message-author-role");
//       const rawRoot = n.querySelector('.markdown, [class*="markdown"]') || n;
//       // Clone to clean without touching page
//       const root = rawRoot.cloneNode(true);

//       // BLOCK 1: Map snippets like in your screenshot
//       root
//         .querySelectorAll(
//           '[data-testid="businesses-map-widget"], [data-w-component="map"], [data-d-component="map"], [class*="map-widget"]',
//         )
//         .forEach((el) => el.remove());

//       // BLOCK 2: Those link-embedded favicon images (tripadvisor, trimbakeshwar trust, redbus, rome2rio, utsav.gov.in)
//       root
//         .querySelectorAll(
//           '[data-testid="webpage-citation-pill"], a[class*="rounded-xl"], img[src*="favicons"], img[src*="google.com/s2"]',
//         )
//         .forEach((el) => el.remove());

//       // BLOCK 3: Also clean the tiny citation spans that leave +1, +2
//       root
//         .querySelectorAll('span[data-testid="webpage-citation-pill"]')
//         .forEach((el) => el.remove());

//       return { role: role === "user" ? "You" : "ChatGPT", root: root };
//     })
//     .filter((m) => m.root.innerText.trim().length > 2); // remove empty after map removal
// }

// // Same perfect markdown logic as before
// function convertTable(tableEl) {
//   const rows = Array.from(tableEl.querySelectorAll("tr"));
//   if (!rows.length) return "";
//   let md = "\n";
//   rows.forEach((tr, i) => {
//     const cells = Array.from(tr.querySelectorAll("th, td")).map((c) =>
//       c.innerText.replace(/\n/g, " ").replace(/\|/g, "\\|").trim(),
//     );
//     if (!cells.length) return;
//     md += "| " + cells.join(" | ") + " |\n";
//     if (i === 0) md += "| " + cells.map(() => "---").join(" | ") + " |\n";
//   });
//   return md + "\n";
// }
// function nodeToMarkdown(node) {
//   if (node.nodeType === 3) return node.textContent;
//   if (node.nodeType !== 1) return "";
//   const tag = node.tagName.toLowerCase();
//   const inner = Array.from(node.childNodes).map(nodeToMarkdown).join("");
//   switch (tag) {
//     case "h1":
//       return `\n# ${inner.trim()}\n\n`;
//     case "h2":
//       return `\n## ${inner.trim()}\n\n`;
//     case "h3":
//       return `\n### ${inner.trim()}\n\n`;
//     case "strong":
//     case "b":
//       return `**${inner}**`;
//     case "em":
//     case "i":
//       return `*${inner}*`;
//     case "code":
//       if (node.parentElement?.tagName.toLowerCase() === "pre")
//         return node.textContent;
//       return `\`${node.textContent}\``;
//     case "pre": {
//       const lang =
//         (node.querySelector("code")?.className.match(/language-(\w+)/) ||
//           [])[1] || "";
//       return `\n\`\`\`${lang}\n${node.innerText.trim()}\n\`\`\`\n\n`;
//     }
//     case "table":
//       return convertTable(node);
//     case "ul":
//       return (
//         "\n" +
//         Array.from(node.children)
//           .filter((c) => c.tagName === "LI")
//           .map((li) => `- ${nodeToMarkdown(li).trim()}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "ol":
//       return (
//         "\n" +
//         Array.from(node.children)
//           .filter((c) => c.tagName === "LI")
//           .map((li, i) => `${i + 1}. ${nodeToMarkdown(li).trim()}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "blockquote":
//       return (
//         "\n" +
//         inner
//           .trim()
//           .split("\n")
//           .map((l) => `> ${l}`)
//           .join("\n") +
//         "\n\n"
//       );
//     case "a": {
//       const href = node.getAttribute("href") || "";
//       if (!href || href.startsWith("#")) return inner;
//       // Skip if it's just an icon link after cleaning
//       if (inner.trim().length < 2) return "";
//       return `[${inner.trim()}](${href})`;
//     }
//     case "hr":
//       return "\n---\n\n";
//     case "br":
//       return " \n";
//     case "p":
//     case "div": {
//       const t = inner.trim();
//       if (!t) return "";
//       if (node.querySelector("table, pre, ul, ol")) return inner;
//       return t + "\n\n";
//     }
//     default:
//       return inner;
//   }
// }
// function toMarkdown(messages) {
//   let md = `# ChatVault Export - ${new Date().toLocaleString()}\n\n`;
//   messages.forEach((m) => {
//     md +=
//       `## ${m.role}\n\n` +
//       nodeToMarkdown(m.root)
//         .replace(/\n{3,}/g, "\n\n")
//         .trim() +
//       "\n\n---\n\n";
//   });
//   return md;
// }

// // NEW: Clean HTML generator - converts clean root to pretty HTML (like markdowntorichtext.com) - NO raw innerHTML
// function nodeToCleanHTML(node) {
//   if (node.nodeType === 3) return node.textContent;
//   if (node.nodeType !== 1) return "";
//   const tag = node.tagName.toLowerCase();
//   const inner = Array.from(node.childNodes).map(nodeToCleanHTML).join("");
//   switch (tag) {
//     case "h1":
//       return `<h1>${inner.trim()}</h1>`;
//     case "h2":
//       return `<h2>${inner.trim()}</h2>`;
//     case "h3":
//       return `<h3>${inner.trim()}</h3>`;
//     case "strong":
//     case "b":
//       return `<strong>${inner}</strong>`;
//     case "em":
//     case "i":
//       return `<em>${inner}</em>`;
//     case "code":
//       if (node.parentElement?.tagName.toLowerCase() === "pre")
//         return node.textContent;
//       return `<code>${node.textContent}</code>`;
//     case "pre": {
//       return `<pre><code>${node.innerText.trim()}</code></pre>`;
//     }
//     case "table": {
//       // Build clean HTML table from DOM
//       const rows = Array.from(node.querySelectorAll("tr"));
//       let html = "<table><thead>";
//       rows.forEach((tr, i) => {
//         const cells = Array.from(tr.querySelectorAll("th, td"));
//         const tagC = i === 0 ? "th" : "td";
//         html +=
//           "<tr>" +
//           cells
//             .map((c) => `<${tagC}>${c.innerText.trim()}</${tagC}>`)
//             .join("") +
//           "</tr>";
//         if (i === 0) html += "</thead><tbody>";
//       });
//       html += "</tbody></table>";
//       return html;
//     }
//     case "ul":
//       return `<ul>${Array.from(node.children)
//         .filter((c) => c.tagName === "LI")
//         .map((li) => `<li>${nodeToCleanHTML(li).trim()}</li>`)
//         .join("")}</ul>`;
//     case "ol":
//       return `<ol>${Array.from(node.children)
//         .filter((c) => c.tagName === "LI")
//         .map((li) => `<li>${nodeToCleanHTML(li).trim()}</li>`)
//         .join("")}</ol>`;
//     case "blockquote":
//       return `<blockquote>${inner.trim()}</blockquote>`;
//     case "a": {
//       const href = node.getAttribute("href") || "#";
//       if (inner.trim().length < 2) return "";
//       return `<a href="${href}">${inner.trim()}</a>`;
//     }
//     case "hr":
//       return "<hr>";
//     case "br":
//       return "<br>";
//     case "p":
//       return `<p>${inner.trim()}</p>`;
//     case "div": {
//       if (node.querySelector("table, pre, ul, ol, p")) return inner;
//       const t = inner.trim();
//       return t ? `<p>${t}</p>` : "";
//     }
//     default:
//       return inner;
//   }
// }

// function toHTML(messages) {
//   let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ChatVault</title>
// <style>
// body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:800px;margin:0 auto;padding:32px;color:#333;line-height:1.6}
// .message{margin:24px 0;padding:20px;border-radius:12px;border:1px solid #e5e7eb}
// .message.You{background:#f0f7ff}.message.ChatGPT{background:#fafafa}
// .message h3{font-size:12px;opacity:0.5;margin:0 0 12px 0;text-transform:uppercase}
// pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow:auto}
// code{background:#f4f4f4;padding:2px 6px;border-radius:4px}
// pre code{background:transparent;padding:0}
// table{border-collapse:collapse;width:100%;margin:16px 0}
// th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}
// th{background:#f9f9f9}
// blockquote{border-left:4px solid #ddd;padding-left:16px;color:#666;margin:16px 0}
// @media print{.message{break-inside:avoid}}
// </style></head><body>
// <h1>ChatVault Export</h1><p><small>${new Date().toLocaleString()} | ${location.href}</small></p>`;

//   messages.forEach((m) => {
//     const cleanHtml = nodeToCleanHTML(m.root);
//     if (cleanHtml.trim().length < 10) return; // skip empty map leftovers
//     html += `<div class="message ${m.role}"><h3>${m.role}</h3>${cleanHtml}</div>`;
//   });
//   html += `</body></html>`;
//   return html;
// }

// function download(name, content) {
//   chrome.runtime.sendMessage({ type: "DOWNLOAD", filename: name, content });
// }
// chrome.runtime.onMessage.addListener((msg) => {
//   const msgs = getMessages();
//   if (msg.type === "SAVE_MD")
//     download(`chatvault-${Date.now()}.md`, toMarkdown(msgs));
//   if (msg.type === "SAVE_HTML")
//     download(`chatvault-${Date.now()}.html`, toHTML(msgs));
// });

console.log("ChatVault v2.3 Final - clean HTML + footer");

function getMessages() {
  const nodes = document.querySelectorAll("[data-message-author-role]");
  return Array.from(nodes)
    .map((n) => {
      const role = n.getAttribute("data-message-author-role");
      const rawRoot = n.querySelector('.markdown, [class*="markdown"]') || n;
      const root = rawRoot.cloneNode(true);
      root
        .querySelectorAll(
          '[data-testid="businesses-map-widget"], [data-w-component="map"], [data-d-component="map"]',
        )
        .forEach((el) => el.remove());
      root
        .querySelectorAll(
          '[data-testid="webpage-citation-pill"], img[src*="favicons"], img[src*="google.com/s2"]',
        )
        .forEach((el) => el.remove());
      return { role: role === "user" ? "You" : "ChatGPT", root: root };
    })
    .filter((m) => m.root.innerText.trim().length > 2);
}

function convertTable(tableEl) {
  const rows = Array.from(tableEl.querySelectorAll("tr"));
  if (!rows.length) return "";
  let md = "\n";
  rows.forEach((tr, i) => {
    const cells = Array.from(tr.querySelectorAll("th, td")).map((c) =>
      c.innerText.replace(/\n/g, " ").replace(/\|/g, "\\|").trim(),
    );
    if (!cells.length) return;
    md += "| " + cells.join(" | ") + " |\n";
    if (i === 0) md += "| " + cells.map(() => "---").join(" | ") + " |\n";
  });
  return md + "\n";
}
function nodeToMarkdown(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return "";
  const tag = node.tagName.toLowerCase();
  const inner = Array.from(node.childNodes).map(nodeToMarkdown).join("");
  switch (tag) {
    case "h1":
      return `\n# ${inner.trim()}\n\n`;
    case "h2":
      return `\n## ${inner.trim()}\n\n`;
    case "h3":
      return `\n### ${inner.trim()}\n\n`;
    case "strong":
    case "b":
      return `**${inner}**`;
    case "em":
    case "i":
      return `*${inner}*`;
    case "code":
      if (node.parentElement?.tagName.toLowerCase() === "pre")
        return node.textContent;
      return `\`${node.textContent}\``;
    case "pre": {
      const lang =
        (node.querySelector("code")?.className.match(/language-(\w+)/) ||
          [])[1] || "";
      return `\n\`\`\`${lang}\n${node.innerText.trim()}\n\`\`\`\n\n`;
    }
    case "table":
      return convertTable(node);
    case "ul":
      return (
        "\n" +
        Array.from(node.children)
          .filter((c) => c.tagName === "LI")
          .map((li) => `- ${nodeToMarkdown(li).trim()}`)
          .join("\n") +
        "\n\n"
      );
    case "ol":
      return (
        "\n" +
        Array.from(node.children)
          .filter((c) => c.tagName === "LI")
          .map((li, i) => `${i + 1}. ${nodeToMarkdown(li).trim()}`)
          .join("\n") +
        "\n\n"
      );
    case "blockquote":
      return (
        "\n" +
        inner
          .trim()
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n") +
        "\n\n"
      );
    case "a": {
      const href = node.getAttribute("href") || "";
      if (!href || inner.trim().length < 2) return inner;
      return `[${inner.trim()}](${href})`;
    }
    case "hr":
      return "\n---\n\n";
    case "br":
      return " \n";
    case "p":
    case "div": {
      const t = inner.trim();
      if (!t) return "";
      if (node.querySelector("table, pre, ul, ol")) return inner;
      return t + "\n\n";
    }
    default:
      return inner;
  }
}
function toMarkdown(messages) {
  let md = `# ChatVault Export - ${new Date().toLocaleString()}\n\n`;
  messages.forEach((m) => {
    md +=
      `## ${m.role}\n\n` +
      nodeToMarkdown(m.root)
        .replace(/\n{3,}/g, "\n\n")
        .trim() +
      "\n\n---\n\n";
  });
  return md;
}
function nodeToCleanHTML(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return "";
  const tag = node.tagName.toLowerCase();
  const inner = Array.from(node.childNodes).map(nodeToCleanHTML).join("");
  switch (tag) {
    case "h1":
      return `<h1>${inner.trim()}</h1>`;
    case "h2":
      return `<h2>${inner.trim()}</h2>`;
    case "h3":
      return `<h3>${inner.trim()}</h3>`;
    case "strong":
    case "b":
      return `<strong>${inner}</strong>`;
    case "em":
    case "i":
      return `<em>${inner}</em>`;
    case "code":
      if (node.parentElement?.tagName.toLowerCase() === "pre")
        return node.textContent;
      return `<code>${node.textContent}</code>`;
    case "pre":
      return `<pre><code>${node.innerText.trim()}</code></pre>`;
    case "table": {
      const rows = Array.from(node.querySelectorAll("tr"));
      let html = '<div style="overflow-x:auto"><table><thead>';
      rows.forEach((tr, i) => {
        const cells = Array.from(tr.querySelectorAll("th, td"));
        const tagC = i === 0 ? "th" : "td";
        html +=
          "<tr>" +
          cells
            .map((c) => `<${tagC}>${c.innerText.trim()}</${tagC}>`)
            .join("") +
          "</tr>";
        if (i === 0) html += "</thead><tbody>";
      });
      html += "</tbody></table></div>";
      return html;
    }
    case "ul":
      return `<ul>${Array.from(node.children)
        .filter((c) => c.tagName === "LI")
        .map((li) => `<li>${nodeToCleanHTML(li).trim()}</li>`)
        .join("")}</ul>`;
    case "ol":
      return `<ol>${Array.from(node.children)
        .filter((c) => c.tagName === "LI")
        .map((li) => `<li>${nodeToCleanHTML(li).trim()}</li>`)
        .join("")}</ol>`;
    case "blockquote":
      return `<blockquote>${inner.trim()}</blockquote>`;
    case "a": {
      const href = node.getAttribute("href") || "#";
      if (inner.trim().length < 2) return "";
      return `<a href="${href}">${inner.trim()}</a>`;
    }
    case "hr":
      return "<hr>";
    case "br":
      return "<br>";
    case "p":
      return `<p>${inner.trim()}</p>`;
    case "div": {
      if (node.querySelector("table, pre, ul, ol, p")) return inner;
      const t = inner.trim();
      return t ? `<p>${t}</p>` : "";
    }
    default:
      return inner;
  }
}
function toHTML(messages) {
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ChatVault Export</title>
<style>
:root{--bg:#ffffff;--fg:#1f2937;--muted:#6b7280;--border:#e5e7eb;--card:#f9fafb;--user:#eef6ff;--code-bg:#0d1117;--code-fg:#e6edf3}
*{box-sizing:border-box}
body{font-family:ui-sans-system,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:860px;margin:0 auto;padding:32px 20px;color:var(--fg);line-height:1.7;background:var(--bg)}
h1{font-size:28px;margin:0 0 6px 0}
small{color:var(--muted)}
.message{margin:22px 0;padding:18px 20px;border-radius:14px;border:1px solid var(--border)}
.message.You{background:var(--user);border-color:#bfdbfe}
.message.ChatGPT{background:var(--card)}
.message h3{font-size:11px;letter-spacing:0.08em;opacity:0.6;margin:0 0 10px 0;text-transform:uppercase}
pre{background:var(--code-bg);color:var(--code-fg);padding:16px;border-radius:10px;overflow:auto;margin:14px 0}
code{background:#f3f4f6;padding:2px 6px;border-radius:6px;font-size:0.92em}
pre code{background:transparent;padding:0;color:inherit}
table{border-collapse:collapse;width:100%;margin:16px 0;font-size:14px}
th,td{border:1px solid var(--border);padding:9px 12px;text-align:left}
th{background:#f3f4f6;font-weight:600}
blockquote{border-left:4px solid #6c5ce7;background:#f8f7ff;padding:10px 16px;margin:16px 0;border-radius:0 8px 8px 0}
a{color:#5b4ae3;text-decoration:none}a:hover{text-decoration:underline}
hr{border:none;border-top:1px solid var(--border);margin:24px 0}
footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--border);text-align:center;color:var(--muted);font-size:13px}
@media print{body{padding:0}.message{break-inside:avoid}footer{position:fixed;bottom:0;width:100%}}
</style></head><body>
<h1>ChatVault Export</h1><p><small>${new Date().toLocaleString()} | ${location.href}</small></p>`;

  messages.forEach((m) => {
    const cleanHtml = nodeToCleanHTML(m.root);
    if (cleanHtml.trim().length < 10) return;
    html += `<div class="message ${m.role}"><h3>${m.role}</h3>${cleanHtml}</div>`;
  });

  // FOOTER - with love and github link
  html += `
<footer>
  Made with ❤️ by Pratik ● <a href="https://github.com" target="_blank">GitHub</a>
  <!-- change the URL here - replace https://github.com with your repo url -->
</footer>
</body></html>`;
  return html;
}
function download(name, content) {
  chrome.runtime.sendMessage({ type: "DOWNLOAD", filename: name, content });
}
chrome.runtime.onMessage.addListener((msg) => {
  const msgs = getMessages();
  if (msg.type === "SAVE_MD")
    download(`chatvault-${Date.now()}.md`, toMarkdown(msgs));
  if (msg.type === "SAVE_HTML")
    download(`chatvault-${Date.now()}.html`, toHTML(msgs));
});

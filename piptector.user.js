// ==UserScript==
// @name         Piptector
// @namespace    https://github.com/Ponkhy/Piptector
// @version      1.0.0
// @description  Highlights specific strings in YouTube Livechat messages by marking them
// @author       Ponkhy
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @downloadURL  https://github.com/Ponkhy/Piptector/raw/main/piptector.user.js
// @updateURL    https://github.com/Ponkhy/Piptector/raw/main/piptector.user.js
// ==/UserScript==

(function() {
    'use strict';

    const keywords = ["niji", "holo"];

    const highlightTextNode = (node) => {
        const textContent = node.textContent;

        let hasMatch = false;

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');

            if (regex.test(textContent)) {
                hasMatch = true;

                node.textContent = textContent.replace(regex, (_, match) => {
                    const span = document.createElement('span');

                    span.style.color = '#c72a2a';
                    span.textContent = match;

                    return span.outerHTML;
                });
            }
        });

        if (hasMatch) {
            const tempContainer = document.createElement('div');

            tempContainer.innerHTML = node.textContent;

            while (tempContainer.firstChild) {
                node.parentNode.insertBefore(tempContainer.firstChild, node);
            }

            node.remove();
        }
    };

    const processMessageElement = (messageElement) => {
        const messageTextElement = messageElement.querySelector('#message');

        if (messageTextElement) {
            const walker = document.createTreeWalker(messageTextElement, NodeFilter.SHOW_TEXT, null, false);

            let textNode;

            while ((textNode = walker.nextNode())) {
                highlightTextNode(textNode);
            }
        }
    };

    const messageElements = document.querySelectorAll('yt-live-chat-text-message-renderer');

    messageElements.forEach(element => {
        processMessageElement(element);
    });

    const observer = new MutationObserver(mutationsList => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName === 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') {
                    processMessageElement(node);
                }
            });
        });
    });

    const targetNode = document.querySelector('yt-live-chat-item-list-renderer');
    if (targetNode) {
        const config = { childList: true, subtree: true };
        observer.observe(targetNode, config);
        console.log("[Piptector]: Observing messages");
    } else {
        console.warn("[Piptector]: Could not observe messages");
    }
})();

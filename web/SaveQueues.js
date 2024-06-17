import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "SaveQueues.MenuButton",
    async setup(app) {
        const localStorageKey = 'Confyui.Queue';
        const menu = document.querySelector(".comfy-menu");
        const hr = document.createElement("hr");

        hr.style.margin = "8px 0";
        hr.style.width = "100%";
        menu.append(hr);
        
        /** Element */
        menu.querySelector("#queue-button").addEventListener('click',   async (e) => {
            // localStorage.setItem(loclaStorageKey, await api.getQueue());
            const res = await api.fetchApi("/queue", { cache: "no-store" });
            const json = await res.json();
            localStorage.setItem(localStorageKey, JSON.stringify(json));
        });
     
        const loadButton = document.createElement("button");
        loadButton.textContent = "Restore Queue";
        menu.append(loadButton);

        loadButton.addEventListener('click',  async () => {
            const json = localStorage.getItem(localStorageKey);
            const data = JSON.parse(json);
            if (data.queue_running == null && data.queue_pending == null) {
                window.alert("no queues");
                return;
            }
            if (Array.isArray(data.queue_running) && Array.isArray(data.queue_running[0])) {
                await api.queuePrompt(0, {
                    output: data.queue_running[0][2],
                    workflow: data.queue_running[0][3].extra_pnginfo.workflow
                });
            }
            if (Array.isArray(data.queue_pending)) {
                for (const p of data.queue_pending.toSorted((a, b) => a[0] - b[0])) {
                    await api.queuePrompt(0, {
                        output: p[2],
                        workflow: p[3].extra_pnginfo.workflow
                    });
                }
            }
        });
    }
})

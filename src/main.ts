import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import shell from 'electron'

import './assets/tailwind.css'

createApp(App).use(store).use(router).mount('#app')

document.addEventListener('keydown', function (e) {
    if (e.which === 123) {
        shell.remote.getCurrentWindow().webContents.toggleDevTools()
    } else if (e.which === 116) {
        location.reload()
    }
})

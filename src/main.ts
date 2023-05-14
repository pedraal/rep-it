import { createApp } from 'vue'
import { createHead } from '@unhead/vue'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import App from './App.vue'

const app = createApp(App)

const head = createHead()
app.use(head)

app.mount('#app')

import './app.css'
import App from './App.svelte'
import Button from './components/Counter.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app

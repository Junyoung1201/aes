import App from 'App';
import './pretendard/pretendard.css';
import './index.css';
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById("root")!).render(
    <App />
)

document.querySelectorAll(`textarea,input[type="text"]`).forEach(el => {
    el.setAttribute("spellcheck","false");
    el.setAttribute("autocomplete","off");
})
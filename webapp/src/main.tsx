
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find the root element");
  // Create a fallback root element
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
  
  const root = createRoot(fallbackRoot);
  try {
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering the app:", error);
    fallbackRoot.innerHTML = '<div style="color: red; padding: 20px;">An error occurred while loading the application. Please refresh the page or check the console for more details.</div>';
  }
} else {
  const root = createRoot(rootElement);
  
  // Render with error boundary
  try {
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering the app:", error);
    rootElement.innerHTML = '<div style="color: red; padding: 20px;">An error occurred while loading the application. Please refresh the page or check the console for more details.</div>';
  }
}

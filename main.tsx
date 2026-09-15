import { createRoot } from 'react-dom/client';
import Home from './app/page';
import data from './app/combined-data.json';
import './app/globals.css';

// The shared page keeps its original data. Adapt local image URLs only in the
// static entry point so GitHub project sites do not request the domain root.
function adaptImages(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'image' && typeof child === 'string' && child.startsWith('/') && !child.startsWith('//')) {
      (value as Record<string, unknown>)[key] = new URL(`.${child}`, document.baseURI).href;
    } else {
      adaptImages(child);
    }
  }
}

adaptImages(data);
createRoot(document.getElementById('root')!).render(<Home />);

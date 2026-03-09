/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import NewsFeed from './components/NewsFeed';
import UserRegistrationModal from './components/UserRegistrationModal';

export default function App() {
  return (
    <div className="min-h-screen">
      <UserRegistrationModal />
      <header className="w-full py-3 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-50 border-b border-white/20 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 uppercase flex items-baseline gap-2">
          CENTINELA FINANCIERO
          <span className="text-xs font-medium text-gray-500 normal-case tracking-normal">Versión G 9.3 en desarrollo</span>
        </h1>
        <a 
          href="https://www.instagram.com/3d_mc_3d/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform shrink-0"
        >
          <img 
            src="https://avatars.githubusercontent.com/u/70527971?v=4&size=64" 
            alt="Logo" 
            className="w-10 h-10 rounded-full shadow-md border-2 border-white"
            referrerPolicy="no-referrer"
          />
        </a>
      </header>
      <main className="max-w-7xl mx-auto">
        <NewsFeed />
      </main>
    </div>
  );
}

import { useState } from 'react';
import MemoTab from './communication/MemoTab';
import AnnouncementTab from './communication/AnnouncementTab';
import AdvertTab from './communication/AdvertTab';
import LetterTab from './communication/LetterTab';

const TABS = [
  { key: 'memo', label: 'Memo', icon: '📋' },
  { key: 'announcement', label: 'Announcement', icon: '📢' },
  { key: 'advert', label: 'Advert', icon: '🎨' },
  { key: 'letter', label: 'Letter', icon: '✉️' },
];

export default function Communications() {
  const [tab, setTab] = useState('memo');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Communications
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Drafts, announcements, adverts, and letters
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border-color)] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition ${
              tab === t.key
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'memo' && <MemoTab />}
        {tab === 'announcement' && <AnnouncementTab />}
        {tab === 'advert' && <AdvertTab />}
        {tab === 'letter' && <LetterTab />}
      </div>
    </div>
  );
}
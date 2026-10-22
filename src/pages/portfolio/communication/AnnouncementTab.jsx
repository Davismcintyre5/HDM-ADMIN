import CommunicationTabBase from './CommunicationTabBase';

const FIELDS = [
  { name: 'ctaUrl', label: 'CTA URL', type: 'text', placeholder: 'https://hdm.co.ke/...' },
  { name: 'highlight1', label: 'Highlight 1', type: 'text', placeholder: 'Key point one' },
  { name: 'highlight2', label: 'Highlight 2', type: 'text', placeholder: 'Key point two' },
  { name: 'highlight3', label: 'Highlight 3', type: 'text', placeholder: 'Key point three' },
];

export default function AnnouncementTab() {
  return (
    <CommunicationTabBase
      type="announcement"
      label="Announcement"
      icon="📢"
      fields={FIELDS}
      titlePlaceholder="Launch of HDM AI Platform"
      bodyPlaceholder="Write the announcement..."
    />
  );
}
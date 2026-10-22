import CommunicationTabBase from './CommunicationTabBase';

const FIELDS = [
  { name: 'to', label: 'To', type: 'text', placeholder: 'All Staff' },
  { name: 'from', label: 'From', type: 'text', placeholder: 'Managing Director' },
  { name: 'cc', label: 'CC', type: 'text', placeholder: 'Department Heads' },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Regarding...' },
];

export default function MemoTab() {
  return (
    <CommunicationTabBase
      type="memo"
      label="Memo"
      icon="📋"
      fields={FIELDS}
      titlePlaceholder="New Company Policy"
      bodyPlaceholder="Write the memo content..."
    />
  );
}
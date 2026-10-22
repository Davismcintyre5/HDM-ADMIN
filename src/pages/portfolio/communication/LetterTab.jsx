import CommunicationTabBase from './CommunicationTabBase';

const FIELDS = [
  { name: 'ourRef', label: 'Our Ref', type: 'text', placeholder: 'HDM/LET/2026/042' },
  { name: 'yourRef', label: 'Your Ref', type: 'text', placeholder: 'Optional' },
  { name: 'recipientName', label: 'Recipient Name', type: 'text', placeholder: 'The Managing Director' },
  { name: 'recipientCompany', label: 'Recipient Company', type: 'text', placeholder: 'Target Company Ltd.' },
  { name: 'recipientAddress', label: 'Recipient Address', type: 'textarea', rows: 2, placeholder: 'P.O. Box 1234-00100, Nairobi' },
  { name: 'subject', label: 'Subject (RE:)', type: 'text', placeholder: 'OFFICIAL BUSINESS MATTER' },
  { name: 'enclosure', label: 'Enclosure Note', type: 'text', placeholder: 'Signed agreement (1 copy)' },
  { name: 'signatoryName', label: 'Signatory Name', type: 'text', placeholder: 'Davix H. McIntyre' },
  { name: 'signatoryTitle', label: 'Signatory Title', type: 'text', placeholder: 'Managing Director' },
];

export default function LetterTab() {
  return (
    <CommunicationTabBase
      type="official-letter"
      label="Letter"
      icon="✉️"
      fields={FIELDS}
      titlePlaceholder="Partnership Agreement Confirmation"
      bodyPlaceholder="Dear Sir/Madam, ..."
    />
  );
}
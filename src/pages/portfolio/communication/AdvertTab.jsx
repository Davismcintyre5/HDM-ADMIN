import CommunicationTabBase from './CommunicationTabBase';

const ADVERT_KINDS = [
  { value: 'services', label: 'Services', desc: 'Bundle all services' },
  { value: 'products', label: 'Products', desc: 'Bundle all projects' },
  { value: 'custom', label: 'Custom', desc: 'Write manually' },
];

const FIELDS = [
  { name: 'ctaUrl', label: 'CTA URL', type: 'text', placeholder: 'https://hdm.co.ke/ai' },
  { name: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'info@hdmtechnologies.com' },
  { name: 'contactPhone', label: 'Contact Phone', type: 'text', placeholder: '+254 768 784 909' },
];

export default function AdvertTab() {
  return (
    <CommunicationTabBase
      type="advert"
      label="Advert"
      icon="🎨"
      advertKinds={ADVERT_KINDS}
      fields={FIELDS}
      titlePlaceholder="HDM AI — The future of intelligence"
      bodyPlaceholder="Write the advert copy..."
    />
  );
}
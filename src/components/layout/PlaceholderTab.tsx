import React from 'react';
import { Construction } from 'lucide-react';

interface Props {
  name: string;
}

export const PlaceholderTab: React.FC<Props> = ({ name }) => {
  return (
    <div className="main-content" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--text-muted)'
    }}>
      <Construction size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
      <h2 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>{name}</h2>
      <p>This section is not yet implemented.</p>
    </div>
  );
};

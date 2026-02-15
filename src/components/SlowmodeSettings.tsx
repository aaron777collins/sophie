import React, { useState } from 'react';
import { Slider, Switch, Typography, Alert } from 'antd';

const { Text } = Typography;

interface SlowmodeSettingsProps {
  currentSettings: {
    enabled: boolean;
    duration: number;
  };
  onSettingsChange: (settings: { enabled: boolean; duration: number }) => void;
}

export const SlowmodeSettings: React.FC<SlowmodeSettingsProps> = ({ 
  currentSettings, 
  onSettingsChange 
}) => {
  const [enabled, setEnabled] = useState(currentSettings.enabled);
  const [duration, setDuration] = useState(currentSettings.duration);

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    onSettingsChange({ enabled: checked, duration });
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    onSettingsChange({ enabled, duration: value });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ marginRight: 16 }}>Enable Slowmode</Text>
        <Switch 
          checked={enabled}
          onChange={handleEnabledChange}
        />
      </div>
      
      {enabled && (
        <>
          <Text>Slowmode Duration: {duration} seconds</Text>
          <Slider
            min={0}
            max={300}
            value={duration}
            onChange={handleDurationChange}
            marks={{
              0: '0s',
              60: '1m',
              300: '5m'
            }}
          />
          <Alert 
            message="Slowmode prevents users from sending messages faster than the set interval." 
            type="info" 
            showIcon 
          />
        </>
      )}
    </div>
  );
};
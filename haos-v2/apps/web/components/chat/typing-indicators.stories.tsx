import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { TypingIndicators } from './typing-indicators';

// Mock providers for Storybook
import { useRoom } from '../../hooks/use-room';
import { useUserSettings } from '../../hooks/use-user-settings';

export default {
  title: 'Chat/TypingIndicators',
  component: TypingIndicators,
} as Meta;

const Template: StoryFn = (args) => {
  // Mock hook implementations for Storybook
  (useRoom as jest.Mock).mockReturnValue({
    typingUsers: [
      { 
        userId: 'user1', 
        displayName: 'Alice', 
        avatarUrl: 'https://i.pravatar.cc/150?u=1' 
      },
      { 
        userId: 'user2', 
        displayName: 'Bob', 
        avatarUrl: 'https://i.pravatar.cc/150?u=2' 
      }
    ]
  });

  (useUserSettings as jest.Mock).mockReturnValue({
    showTypingIndicators: true
  });

  return <TypingIndicators roomId="storybook-room" {...args} />;
};

export const Default = Template.bind({});
Default.args = {};

export const MultipleUsers = Template.bind({});
MultipleUsers.args = {};

export const Disabled = () => {
  // Mock hook to show disabled state
  (useRoom as jest.Mock).mockReturnValue({
    typingUsers: [
      { 
        userId: 'user1', 
        displayName: 'Alice', 
        avatarUrl: 'https://i.pravatar.cc/150?u=1' 
      }
    ]
  });

  (useUserSettings as jest.Mock).mockReturnValue({
    showTypingIndicators: false
  });

  return <TypingIndicators roomId="storybook-room" />;
};
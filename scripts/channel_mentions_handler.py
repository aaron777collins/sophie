#!/usr/bin/env python3
import re
import json
import logging
import os
from datetime import datetime

class ChannelMentionsHandler:
    def __init__(self, log_path='/home/ubuntu/clawd/logs/channel_mentions.log'):
        """
        Initialize the channel mentions handler
        
        Args:
            log_path (str): Path to log file for tracking mentions
        """
        # Ensure log directory exists
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        
        logging.basicConfig(
            filename=log_path, 
            level=logging.INFO, 
            format='%(asctime)s - %(levelname)s: %(message)s'
        )
        self.log_path = log_path
        self.mentions_log = []

    def parse_mention(self, message):
        """
        Parse a message for channel mentions
        
        Args:
            message (str): The message to parse
        
        Returns:
            dict: Parsed mention details
        """
        # Basic channel mention pattern
        channel_pattern = re.compile(r'#(\w+)')
        matches = channel_pattern.findall(message)
        
        if not matches:
            return None
        
        mention_details = {
            'timestamp': datetime.now().isoformat(),
            'channels': matches,
            'raw_message': message
        }
        
        return mention_details

    def log_mention(self, mention_details):
        """
        Log channel mention details
        
        Args:
            mention_details (dict): Details of the channel mention
        """
        if not mention_details:
            return
        
        logging.info(f"Channel Mentions: {json.dumps(mention_details)}")
        self.mentions_log.append(mention_details)

    def process_message(self, message):
        """
        Main method to process a message
        
        Args:
            message (str): Message to process
        """
        mention_details = self.parse_mention(message)
        if mention_details:
            self.log_mention(mention_details)
        
        return mention_details

def main():
    handler = ChannelMentionsHandler()
    
    # Example usage
    test_messages = [
        "Hey check out #general for updates",
        "Meeting in #engineering tomorrow",
        "No channel mentions here"
    ]
    
    for msg in test_messages:
        result = handler.process_message(msg)
        print(f"Processed: {result}")

if __name__ == '__main__':
    main()
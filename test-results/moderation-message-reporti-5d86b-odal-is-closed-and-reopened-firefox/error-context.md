# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - heading "Message Reporting Modal Test Page" [level=1] [ref=e4]
    - button "Report Message" [active] [ref=e5] [cursor=pointer]
    - generic [ref=e7]:
      - generic [ref=e9]: Report Message
      - generic [ref=e10]:
        - generic [ref=e11]:
          - strong [ref=e12]: "Reported Message:"
          - generic [ref=e13]:
            - generic [ref=e14]: This is a test message that needs to be reported
            - generic [ref=e15]: "From: @sender:example.com"
        - generic [ref=e16]:
          - generic [ref=e17]: "Reason for report:"
          - button "Select a reason ▼" [ref=e19] [cursor=pointer]:
            - text: Select a reason
            - generic [ref=e20]: ▼
        - generic [ref=e21]:
          - generic [ref=e22]: "Additional details (optional):"
          - textbox "Provide additional context about why you're reporting this message..." [ref=e23]
          - generic [ref=e24]: 0 / 500
        - generic [ref=e25]: False reports may result in action taken against your account
      - generic [ref=e26]:
        - button "Cancel" [ref=e27] [cursor=pointer]
        - button "Report Message" [ref=e28] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
  - alert [ref=e39]
```
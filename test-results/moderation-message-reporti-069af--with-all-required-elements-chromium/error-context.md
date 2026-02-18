# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - heading "Message Reporting Modal Test Page (Radix UI)" [level=1] [ref=e4]
    - button "Report Message (Radix)" [active] [ref=e5] [cursor=pointer]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "Report Message" [level=2] [ref=e9]
        - button "×" [ref=e10] [cursor=pointer]
      - generic [ref=e11]:
        - generic [ref=e12]:
          - strong [ref=e13]: "Reported Message:"
          - generic [ref=e14]:
            - generic [ref=e15]: This is a test message that needs to be reported
            - generic [ref=e16]: "From: @sender:example.com"
        - generic [ref=e17]:
          - generic [ref=e18]: "Reason for report: *"
          - combobox [ref=e19]:
            - option "Select a reason" [selected]
            - option "Spam"
            - option "Harassment"
            - option "Inappropriate"
            - option "Violence"
            - option "Hate Speech"
            - option "Other"
          - generic [ref=e20]: Please select a reason
        - generic [ref=e21]:
          - generic [ref=e22]: "Additional details (optional):"
          - textbox "Provide additional context about why you're reporting this message..." [ref=e23]
          - generic [ref=e24]: 0/500
      - generic [ref=e25]:
        - button "Cancel" [ref=e26] [cursor=pointer]
        - button "Report Message" [disabled] [ref=e27]
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```
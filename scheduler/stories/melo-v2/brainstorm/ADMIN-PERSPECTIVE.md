# Admin Perspective Brainstorm - Melo V2

**Perspective:** Server Administrator
**Created:** 2026-02-22
**Purpose:** Comprehensive user stories from admin viewpoint

---

## User Stories by Category

### 1. Server Creation & Setup

- As an admin, I want to create a new server so that I can start a community
- As an admin, I want to use server templates so that I can quickly set up common configurations
- As an admin, I want to customize server name and icon so that it represents my community
- As an admin, I want to set a server description so that members understand the purpose
- As an admin, I want to configure server verification levels so that I control who can participate
- As an admin, I want to set default notification settings so that members have a good experience
- As an admin, I want to configure the server as private/public so that I control discoverability

### 2. Channel Management

- As an admin, I want to create channels so that conversations are organized
- As an admin, I want to create channel categories so that related channels are grouped
- As an admin, I want to reorder channels so that important ones are at the top
- As an admin, I want to set channel topics so that members understand the purpose
- As an admin, I want to configure channel permissions so that the right people have access
- As an admin, I want to create voice channels so that members can talk
- As an admin, I want to set slowmode on channels so that spam is prevented
- As an admin, I want to archive channels so that old content is preserved but hidden
- As an admin, I want to delete channels so that unused channels are removed

### 3. Role Management

- As an admin, I want to create custom roles so that I can define permission sets
- As an admin, I want to configure role permissions granularly so that roles do exactly what I intend
- As an admin, I want to set role colors so that members are visually distinguished
- As an admin, I want to set role hierarchy so that higher roles can manage lower ones
- As an admin, I want to make roles mentionable so that groups can be notified
- As an admin, I want to assign multiple roles to users so that permissions stack
- As an admin, I want to create role-specific channels so that only certain roles can access

### 4. Member Management

- As an admin, I want to view all members so that I know who's in my server
- As an admin, I want to search/filter members so that I can find specific users
- As an admin, I want to assign roles to members so that they have appropriate permissions
- As an admin, I want to view member join dates so that I know tenure
- As an admin, I want to see member activity so that I know who's engaged
- As an admin, I want to transfer server ownership so that someone else can take over
- As an admin, I want to prune inactive members so that the member list is accurate

### 5. Invite Management

- As an admin, I want to create invite links so that people can join
- As an admin, I want to set invite expiration so that links don't work forever
- As an admin, I want to limit invite uses so that membership is controlled
- As an admin, I want to view invite analytics so that I know how members found us
- As an admin, I want to revoke invites so that unwanted links stop working
- As an admin, I want to create permanent invites so that shareable links always work
- As an admin, I want to see who created which invites so that I can track sources

### 6. Server Settings

- As an admin, I want to configure AFK timeout so that inactive voice users are moved
- As an admin, I want to set up welcome messages so that new members are greeted
- As an admin, I want to configure auto-roles so that new members get default roles
- As an admin, I want to enable/disable features so that the server has what it needs
- As an admin, I want to configure embed permissions so that I control what's previewed
- As an admin, I want to set content filters so that inappropriate content is blocked

### 7. Security & Privacy

- As an admin, I want to require email verification so that accounts are legitimate
- As an admin, I want to enable 2FA requirement for mods so that mod accounts are secure
- As an admin, I want to view audit logs so that I can see what actions were taken
- As an admin, I want to configure E2EE settings so that privacy is maintained
- As an admin, I want to set up verification gates so that new members are vetted
- As an admin, I want to configure message retention so that old messages are cleaned up

### 8. Moderation Tools

- As an admin, I want to assign moderator roles so that others can help manage
- As an admin, I want to configure auto-moderation rules so that common issues are caught
- As an admin, I want to set up banned words lists so that prohibited content is filtered
- As an admin, I want to configure spam protection so that bots are blocked
- As an admin, I want to review reported content so that issues are addressed
- As an admin, I want to see moderation statistics so that I know what's being actioned

### 9. Analytics & Insights

- As an admin, I want to see member growth over time so that I know if the community is growing
- As an admin, I want to see message activity so that I know which channels are active
- As an admin, I want to see peak activity times so that I can schedule events
- As an admin, I want to see member retention so that I know if people are staying
- As an admin, I want to export analytics data so that I can analyze offline

### 10. Backup & Recovery

- As an admin, I want to export server data so that I have a backup
- As an admin, I want to import server settings so that I can restore from backup
- As an admin, I want to clone channels so that I can duplicate configurations
- As an admin, I want to see deleted content (if configured) so that I can recover if needed

---

## Contingencies

| Scenario | Expected Behavior | Priority |
|----------|-------------------|----------|
| Accidental channel deletion | Confirmation dialog, 7-day recovery window | High |
| Role permission misconfiguration | Preview before save, revert option | High |
| Mass member join (raid) | Auto-lockdown, captcha verification | High |
| Admin account compromised | 2FA requirement, audit log alert | Critical |
| Server reaches capacity | Clear messaging, upgrade path | Medium |
| Invite link leaked | Easy revocation, usage tracking | High |
| Matrix federation issues | Clear status indicator, retry mechanisms | Medium |

---

## Dependencies

| Feature | Depends On |
|---------|-----------|
| Create server | Authentication, Matrix homeserver |
| Create channel | Server ownership, Room creation API |
| Assign roles | Role exists, Member exists |
| View audit log | Sufficient permissions, Logging enabled |
| Invite management | Server ownership, Invite API |
| Analytics | Data collection enabled, Storage |
| Auto-moderation | Rules configured, Webhook/event system |

---

## Edge Cases

1. **Server with no other admins** - Prevent owner from leaving without transferring
2. **Role hierarchy conflict** - Lower roles cannot modify higher roles
3. **Channel permission override** - Show clear indicator when channel differs from category
4. **Maximum channel limit reached** - Show clear error with solution
5. **Invite used by banned user** - Block join, notify admin
6. **Admin tries to ban themselves** - Prevent action
7. **Last moderator removed** - Warning before removal
8. **Analytics data older than retention** - Show "data unavailable" gracefully

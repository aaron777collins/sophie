# Build System Patterns

## Successful Next.js Upgrade Pattern

**From daily experience 2026-02-15:**

### 1. Identify Root Cause
- Look beyond surface errors to underlying version/compatibility issues
- Check for experimental features that became stable
- Verify Node.js version compatibility

### 2. Targeted Upgrades
- **Media Export Issues** → Check URI handling for non-standard formats
- **Lockfile Conflicts** → Clean upgrade to latest stable version
- **Server Action Errors** → Remove experimental flags when upgrading to stable

### 3. Comprehensive Validation
```bash
# Standard validation sequence:
npm run build        # Must exit 0
npm run dev         # Must start without errors  
npm run lint        # Should pass (if configured)
npx tsc --noEmit    # TypeScript check
```

### 4. Document Everything
- Log exact commands used
- Note specific file changes made
- Capture success criteria verification
- Record any remaining warnings/issues

## Feature Development Pattern

**Successfully used for channel mentions & emoji autocomplete:**

### 1. Pattern Analysis
- Study existing similar implementations first
- Identify reusable hooks and components
- Understand established architecture patterns

### 2. Consistent Implementation
- Follow existing naming conventions
- Reuse established UI patterns
- Maintain consistent TypeScript types

### 3. Complete Feature Delivery
- Include all required functionality (search, navigation, selection)
- Add comprehensive test coverage
- Ensure build passes without errors
- Document usage and integration

### 4. Integration Testing
- Verify components work together
- Test keyboard navigation thoroughly
- Validate responsive design
- Check accessibility compliance

## Dependency Management

### Version Conflict Resolution
- **react-window**: v2 had breaking changes → downgrade to v1.8.10
- **Next.js**: Experimental server actions → upgrade to stable
- **lockfile**: Multiple lockfiles cause warnings → configure turbopack.root

### Best Practices
- Always check breaking changes before upgrading
- Test incrementally (don't upgrade everything at once)
- Keep lockfiles clean and consistent
- Document rationale for version choices

## Build Health Monitoring

### Early Warning Signs
- Lockfile conflicts or multiple package managers
- Experimental flags in production dependencies
- Version mismatches between related packages
- Build warnings about deprecated features

### Preventive Measures
- Regular dependency audits
- Staged upgrades (dev → staging → prod)
- Automated build health checks
- Clear upgrade documentation and rollback plans

## TypeScript Integration

### Type Safety Patterns
- Define interfaces for all component props
- Use proper Matrix SDK types where available  
- Create type guards for runtime validation
- Export types alongside components

### Build Error Resolution
- Address TypeScript errors before functionality
- Don't use `any` or disable checks as shortcuts
- Create proper type definitions for third-party libraries
- Test type coverage with strict mode enabled

## Last Updated
[2026-02-15 23:05 EST] Initial documentation based on daily reflection analysis
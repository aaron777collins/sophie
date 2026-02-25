# Singleton Pattern Insights

## [2026-02-24] Dependency Injection + Singleton = State Pollution Risk

### The Problem Pattern
When using dependency injection with singleton classes, the first instance's configuration gets cached and reused for all subsequent instances, even when different configurations are expected.

### Examples Encountered
1. **Logger Class** - First pipeline's PathProvider cached, all subsequent pipelines logged to same directory
2. **GeneratorPathProvider** - Spatial filter cache shared between different radii configurations

### Root Cause
`StandardDependencyInjection` + `SingletonABCMeta` combination creates global state that persists across logical boundaries (different pipeline runs).

### Solutions Applied
- Clear `SingletonABCMeta._instances` between pipeline runs
- Consider dependency injection alternatives that don't rely on global singletons

### Architectural Implications
- Singleton patterns convenient but dangerous for stateful objects
- Need clear lifecycle management for cached instances
- Consider factory patterns instead of global singletons for configuration-dependent objects

### Testing Requirements
- Automated tests for singleton cache clearing
- Multi-instance configuration testing
- State isolation validation between runs
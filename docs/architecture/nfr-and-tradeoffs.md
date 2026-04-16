# NFRs and Trade-offs

## Targets
- Dashboard load target: < 2s on local demo dataset.
- CRUD request target: < 300ms under normal local load.
- Drag feedback target: < 1s with immediate visual movement and post-drop persistence.

## Trade-off
Primary trade-off: simple transactional reorder logic over highly optimized batch SQL updates.

Rationale: the MVP favors readability and correctness over micro-optimizations. Current volume assumptions (single user/small teams) make this acceptable while preserving clear upgrade paths.

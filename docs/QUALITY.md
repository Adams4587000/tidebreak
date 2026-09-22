# Quality and validation plan

## Evidence, not labels
The target is the strongest original game we can demonstrate within the jam constraints. No claim of commercial AAA parity or of surpassing a prior build without a comparison. Judge the playable moving result, on desktop and real touch input.

## Before content expansion
- Make an enjoyable arc of acceleration, steering, boost, wave response and recovery.
- Prove start, race completion, restart, and pause on keyboard and touch.
- Verify the boat reads against every environment, with a stable horizon and visible turn exits.
- Verify that waves and boat motion agree; spray must originate at hull contact.

## Reference process
Atlas produces references and images. The recipe recommends three independent geometry approaches per asset. This build compares multiple boat silhouettes and prop variants, then refines selected modules in context; some prop candidates are parameter variants rather than independent constructions. The dystopian rebuild uses six distinct hull construction branches and iterative material, multi-angle and full-race review; it does not claim the longest recipe’s full three-independent-candidates-per-asset or blind AAA comparison workflow. Shipping geometry is verified and reviewed from multiple sides. Keep references and rejected candidates outside the shipping folder. Shared art direction: STYLE.md.

## Lessons adapted from the user's Rust 17 notes
- A real-input race gate exercises turns, boost, route choice, finish and restart.
- Match the sky, horizon and water fog. Water now occupies the role of Rust's ground plane.
- Share texture sets, control texel density and add macro variation without excessive materials.
- Measure geometry before placing, grounding or scaling it.
- Keep static batches spatially bounded and preserve animated asset hierarchies.
- Use selective detail at the camera, not unconditional 2K textures or chamfers everywhere.
- No blanket desert effects: dust, heat shimmer, worn paths and sand fillets do not transfer to every location.
- Preserve each review's screenshots and verdict. Repeated structural failure requires redesign.

## Budgets
External jam ceilings: 20 seconds ready on the supplied 4G profile; 10 MB body bytes; 900 draws; 1.5 million triangles. Aim below these with room for worst-case viewpoints and phone layout. Treat software-rendered fps only as a diagnostic. Measure real-device performance separately.

## Review passes
1. Handling and route readability.
2. Hero boat, water interaction, lighting and materials.
3. Full race, mobile UI, audio, progression and clean release.
Do further work where evidence identifies an actionable defect. Do not loop on a subjective promise of perfection.

## Input and fairness
Phone: large steering area plus separate boost/brake; desktop: arrows/WASD with boost and brake. No requirement for a gyro. The dock has a close rider inspection view and locked crew previews. Opponents use the same route, vehicle specifications and finite energy rules, with lane avoidance and recoverable line mistakes. They navigate route coordinates rather than reproducing the player’s complete free-steering physics. Track progress must be ordered so shortcuts cannot skip the whole race. Gate instrumentation reads real state and never fabricates movement.

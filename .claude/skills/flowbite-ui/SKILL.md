---
name: flowbite-ui
description: Build and review UI for OpenWarnDEV using Flowbite React, Tailwind CSS, Next.js and Capacitor. Use when creating, modifying, reviewing or refactoring UI components, layouts, forms, dialogs, navigation, cards, alerts, buttons, responsive views or mobile UI.
---

# Flowbite UI Skill – OpenWarnDEV

## Purpose
Build consistent, accessible and production‑ready UI for OpenWarnDEV using:
- Next.js
- React / TypeScript
- Flowbite React
- Tailwind CSS
- Capacitor
- Firebase

The application must work well as:
1. Web application
2. Mobile application inside Capacitor
3. Responsive UI on small phones through large desktop screens

OpenWarnDEV is a warning and disaster‑information application. UI must therefore prioritize:
- clarity
- fast comprehension
- accessibility
- reliability
- low cognitive load
- mobile usability
- clear warning states

---

## 1. Before changing UI
- **Do NOT** immediately create new components.
- Inspect only the relevant files:
  1. Existing component
  2. Parent component
  3. Relevant styles
  4. Existing UI primitives
  5. `docs/STYLEGUIDE.md` if relevant
  6. `docs/ARCHITECTURE.md` if architecture affects the change
- Prefer existing components over creating duplicates.
- Search for existing implementations before introducing:
  - Button
  - Modal
  - Drawer
  - Card
  - Alert
  - Badge
  - Dropdown
  - Tabs
  - Input
  - Select
  - Loading state
  - Error state
- Do not scan the entire repository unless necessary.

---

## 2. UI technology rules
- Use Flowbite React components whenever an appropriate component exists.
- Prefer:
  ```tsx
  import { Button } from "flowbite-react";
  ```
  over creating a custom button.
- Prefer Flowbite components for:
  - Button
  - Alert
  - Badge
  - Card
  - Modal
  - Drawer
  - Dropdown
  - Navbar
  - Sidebar
  - Tabs
  - Toast
  - Spinner
  - Tooltip
  - TextInput
  - Select
  - Checkbox
  - Radio
  - Toggle
  - Label
- Use Tailwind classes for layout and customization.
- Do not introduce another UI framework without explicit approval.
- Do not introduce shadcn/ui, MUI, Chakra, Ant Design or another component library when Flowbite can satisfy the requirement.

---

## 3. Existing design system first
- Before creating a new visual pattern, search the project for similar UI.
- Reuse:
  - existing spacing
  - typography
  - border radius
  - shadows
  - colors
  - icon sizes
  - responsive breakpoints
  - interaction patterns
- Do not create arbitrary one‑off styling.
- If the project already defines a design token or utility, use it.

---

## 4. Next.js rules
- Respect the Server Component / Client Component boundary.
- Default to Server Components.
- Use:
  ```js
  "use client";
  ```
  only when required for:
  - browser APIs
  - user interaction
  - React state
  - effects
  - Capacitor APIs
  - map interaction
  - Firebase client SDK interaction where required
- Do not turn large component trees into Client Components unnecessarily.
- Keep interactive components small.
- Prefer:
  - Server Component
    ↓
  - small Client Component
- Over:
  - entire page = Client Component

---

## 5. Capacitor rules
- The UI must work inside a Capacitor WebView.
- Always consider:
  - small screens
  - safe areas
  - touch targets
  - virtual keyboard
  - orientation
  - device viewport
  - bottom navigation
  - system status bar
  - offline / poor network conditions
- Use safe‑area‑aware spacing where necessary.
  ```css
  className="pb-[env(safe-area-inset-bottom)]"
  ```
- Do not rely exclusively on:
  - 100vh
- Use modern viewport units where appropriate:
  - 100dvh
- Avoid hover‑only interactions.
- Every important interaction must work with touch.

---

## 6. Mobile‑first
- Design mobile‑first.
- Minimum target: 320px
- Primary mobile range: 320px – 430px
- Then progressively enhance for:
  - tablet
  - desktop
  - large desktop
- Never assume desktop width.
- Avoid horizontal scrolling unless explicitly required.
- Interactive controls should generally have at least approximately:
  - 44 × 44 px touch area.

---

## 7. OpenWarnDEV UI principles
- This is a safety‑oriented application.
- UI must communicate state immediately.
- Use explicit states:
  - NORMAL
  - INFO
  - NOTICE
  - WARNING
  - CRITICAL
  - ERROR
  - UNKNOWN
  - LOADING
  - OFFLINE
- Do not rely on color alone.
- Example:
  - BAD: red = danger, green = safe
  - BETTER: CRITICAL + icon + label + color + supporting text
- Warning UI must remain understandable for users with color‑vision deficiencies.

---

## 8. Maps
- Map UI is a primary application surface.
- Do not unnecessarily place large UI elements over the map.
- Controls should:
  - be easy to reach
  - not block important map content
  - have clear labels / tooltips where appropriate
  - have sufficient touch targets
  - respect safe areas
- For map controls prefer compact controls.
- Examples:
  - Location
  - North
  - 3D
  - Zoom
  - Layers
  - Warnings
- Do not redesign the map library controls unless necessary.

---

## 9. Cards
- Use cards to group related information.
- Avoid excessive card nesting.
- Bad:
  ```text
  Card
   ├─ Card
   │   └─ Card
  ```
- Prefer clear sections.
- Warning cards should expose the most important information first:
  - [SEVERITY]
  - Title
  - Short explanation
  - Region / time / source
  - [Action]

---

## 10. Forms
- Forms must have:
  - visible labels
  - useful validation
  - clear error messages
  - disabled / loading states
  - keyboard‑friendly interaction
  - mobile‑friendly inputs
- Never rely exclusively on placeholders as labels.
- Use Flowbite form components where appropriate.
- Example:
  ```tsx
  <Label htmlFor="email" value="E‑Mail" />
  <TextInput
    id="email"
    type="email"
    required
  />
  ```

---

## 11. Loading states
- Do not leave blank UI while loading.
- Use appropriate Flowbite loading components.
- For larger content use skeletons or meaningful placeholders.
- Loading states must not cause large layout shifts.

---

## 12. Error states
- Every asynchronous UI should have an intentional error state.
- Example:
  ```text
  Daten konnten nicht geladen werden.
  Bitte versuche es erneut.
  [Erneut versuchen]
  ```
- Do not expose:
  - stack traces
  - Firebase internals
  - API keys
  - internal identifiers
  - sensitive technical information
  to normal users.

---

## 13. Empty states
- Empty states should explain why nothing is displayed.
- Bad:
  ```text
  Keine Daten.
  ```
- Better:
  ```text
  Keine Warnungen gefunden.
  Für diese Region liegen aktuell keine aktiven Warnungen vor.
  ```
- If an action can resolve the empty state, provide it.

---

## 14. Accessibility
- All UI must be accessible.
- Requirements:
  - semantic HTML
  - keyboard navigation
  - visible focus states
  - accessible labels
  - meaningful button text
  - sufficient contrast
  - screen‑reader‑friendly status messages
  - no color‑only meaning
- Icon‑only buttons require an accessible label.
- Example:
  ```tsx
  <Button aria-label="Standort anzeigen">
    …
  </Button>
  ```
- Do not use:
  ```tsx
  <div onClick={…}>
  ```
  when a semantic button is appropriate.

---

## 15. Icons
- Use the project's existing icon system.
- Do not install a new icon library just to add one icon.
- Icons must communicate meaning.
- Decorative icons should not unnecessarily be announced by screen readers.

---

## 16. Dark mode
- Support the project's existing dark‑mode strategy.
- Do not introduce a separate dark‑mode implementation.
- When using Tailwind, use existing dark variants where appropriate:
  - `dark:bg-gray-800`
  - `dark:text-white`
- Ensure warning states remain distinguishable in both themes.

---

## 17. Firebase
- Never put secrets in UI code.
- Never expose:
  - private keys
  - service‑account credentials
  - server credentials
  - privileged Firebase credentials
- UI authorization is NOT security.
- Never assume:
  ```js
  if (user.isAdmin) {
    showAdminButton();
  }
  ```
  provides security.
- Authorization must be enforced server‑side / through Firebase Security Rules.
- The UI should only reflect authorization already enforced by the backend.

---

## 18. Performance
- Avoid unnecessary client‑side JavaScript.
- Do not import large libraries for trivial UI.
- Prefer:
  - existing Flowbite component
  + Tailwind classes
- Over:
  - new dependency
  + new abstraction
  + new component library
- Avoid unnecessary re‑renders.
- For large lists use appropriate virtualization / pagination strategies.
- Do not load expensive map / data functionality until needed.

---

## 19. Component design
- Components should have one clear responsibility.
- Prefer:
  - `WarningCard`
  - `WarningBadge`
  - `WarningDetails`
  - `WarningList`
- Over:
  - `EverythingWarningComponent`
- Avoid premature abstraction.
- Do not create a component solely to save three lines of JSX.
- Create reusable components when the pattern occurs repeatedly or represents a meaningful domain concept.

---

## 20. Tailwind rules
- Prefer readable Tailwind classes.
- Avoid huge unreadable class strings when a component abstraction is genuinely justified.
- Do not use arbitrary values when an existing Tailwind / Flowbite value works.
- Avoid excessive:
  - `!important`
- Avoid inline styles unless technically necessary.
- Do not fight Flowbite's styling system unnecessarily.

---

## 21. Security review
- When changing UI that interacts with:
  - authentication
  - authorization
  - user data
  - Firebase
  - URLs
  - external content
  - HTML
  - Markdown
  - user‑generated content
- Perform a security review.
- Look for:
  - XSS
  - unsafe HTML rendering
  - URL injection
  - open redirects
  - leaking sensitive data
  - client‑side authorization assumptions
  - insecure Firebase queries
  - exposed configuration
  - unsafe deep links
  - Capacitor bridge misuse
- Never use:
  ```js
  dangerouslySetInnerHTML
  ```
  unless absolutely necessary and the content is properly sanitized.

---

## 22. Do not over‑engineer
- For every UI task ask:
  - Does Flowbite already solve this?
  - Does the project already have this component?
  - Can Tailwind solve it?
  - Can an existing component be extended?
  - Is a new dependency actually necessary?
- Prefer the smallest correct solution.

---

## 23. Verification
- After UI changes, run the smallest relevant checks.
- Prefer:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
- Use only commands that actually exist in the project.
- For UI changes verify:
  - desktop
  - mobile
  - dark mode
  - loading
  - error
  - empty
  - authenticated state
  - unauthenticated state
  - keyboard interaction
  - touch interaction
- Do not claim a check passed unless it was actually run.

---

## 24. Completion criteria
- A UI task is complete only when:
  - existing components were reused where appropriate
  - Flowbite was used where appropriate
  - TypeScript is valid
  - responsive behavior is handled
  - mobile touch interaction works
  - accessibility was considered
  - loading / error / empty states exist where relevant
  - Firebase security assumptions are correct
  - no unnecessary dependency was introduced
  - relevant tests / checks pass
  - token efficiency

---

## 25. Keep context small
- Do NOT read the entire repository for a UI task.
- Read only:
  - relevant page / component
  - relevant parent
  - existing reusable UI components
  - relevant style guide
  - relevant types / data contracts
- Only inspect additional files when required.
- When searching for examples, search by component / domain name first.
- Do not repeatedly reread the same files.
- Prefer concise summaries over copying large files into context.

---

## 26. Default implementation pattern
- For a normal UI task:
  1. Inspect relevant UI
  2. Find existing component
  3. Check STYLEGUIDE if relevant
  4. Implement smallest solution
  5. Check responsive behavior
  6. Check accessibility
  7. Check loading / error states
  8. Run relevant validation
  9. Report changed files + validation
- Do not expand scope without a reason.

---

**Speicherort:**

```text
.claude/skills/flowbite-ui/SKILL.md
```

In deinem OpenWarnDEV‑Repo passt das besonders gut, weil die bestehende Vision bereits Web + Capacitor + mobile Nutzung + Karten‑/Warnungs‑UI vorsieht.

Wenn du die Skill anschließend in Claude Code testen willst, reicht z. B.:

```text
Use the flowbite-ui skill to build the warning card for the map.
```

Oder noch besser als dauerhafte Regel in deiner CLAUDE.md:

```text
For all UI work, use the `flowbite-ui` skill unless explicitly instructed otherwise.
```

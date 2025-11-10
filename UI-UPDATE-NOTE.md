# UI Framework Update Note

**Date:** 2025-11-10

## Important Change

The project has been updated to use **Tailwind CSS** instead of Ant Design based on the UI mockup provided in `ui-design/`.

### What Changed

- ❌ **Removed:** Ant Design (antd) library
- ✅ **Added:** Tailwind CSS
- ✅ **Added:** Material Symbols Outlined icons
- ✅ **Added:** Inter font from Google Fonts

### Updated Documentation

The following files have been updated with UI design references:

1. ✅ **PDR.md** - Added UI/UX Design Reference section (Section 4)
2. ✅ **CLAUDE.md** - Added comprehensive UI Design System section
3. ⏳ **TASKS.md** - Needs update to reflect Tailwind CSS approach
4. ⏳ **PLANNING.md** - Needs update to reflect Tailwind CSS approach

### For AI Agents

When implementing components:
- **DO** follow the design mockup in `ui-design/screen.png` and `ui-design/code.html`
- **DO** use Tailwind CSS utility classes
- **DO** use Material Symbols Outlined icons
- **DO** reference the UI Design System section in CLAUDE.md
- **DON'T** use Ant Design components
- **DON'T** use old Ant Design examples found in documentation

### Design System Quick Reference

- **Primary Color:** #135bec
- **Font:** Inter
- **Icons:** Material Symbols Outlined
- **CSS:** Tailwind CSS with dark mode support
- **Layout:** Sidebar (256px) + Main Content (flex-1)

See CLAUDE.md UI Design System section for complete specifications.

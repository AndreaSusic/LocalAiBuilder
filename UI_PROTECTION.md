# UI Protection Guidelines

## STRICT RULES FOR UI CHANGES

1. **NO UI MODIFICATIONS** without explicit user permission
2. **CONTENT-ONLY CHANGES** are allowed:
   - Adding/updating text content
   - Adding/updating images
   - Adding/updating data from Google Business Profile
   - Fixing functionality bugs

3. **FORBIDDEN UI CHANGES** include:
   - Changing layouts, positioning, or grid structures
   - Modifying colors, fonts, or styling
   - Altering component structure or sections order
   - Adding/removing navigation elements
   - Changing responsive breakpoints
   - Modifying spacing, margins, or padding

4. **SAFE OPERATIONS**:
   - Importing products from GBP data
   - Adding contact information from GBP
   - Enhancing existing sections with authentic business data
   - Color contrast analysis and recommendations (analysis only, no automatic changes)

## Current Task Permissions:
- ✅ Import products from GBB data
- ✅ Add contact information from GBP
- ✅ Add images from GBP
- ✅ Color contrast analysis
- ❌ NO layout, styling, or structural changes

## Implementation Strategy:
1. Work within existing component structure
2. Enhance data only, not presentation
3. Use existing CSS classes and styling
4. Focus on content integration, not visual changes
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Korean posture correction web application called "수숨슬립 자세교정 앱" (Susum Sleep Posture Correction App). It's a Next.js application that helps users perform posture correction exercises using a specialized pillow called "수숨슬립" (Susum Sleep), with real-time pose detection using MediaPipe.

## Common Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Key Technologies & Architecture

### Frontend Stack
- **Next.js 15.2.4** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library (configured in `components.json`)
- **Radix UI** primitives for accessible components

### Pose Detection System
- **MediaPipe Pose** for real-time posture analysis
- Camera API for video stream capture
- Custom pose validation logic in `components/posture-detection.tsx`
- Fallback simulation mode when MediaPipe is unavailable

### Project Structure
```
app/                     # Next.js App Router pages
  ├── page.tsx          # Landing page (Korean)
  ├── postures/         # Exercise selection page
  ├── posture/[id]/     # Individual exercise page with pose detection
  ├── complete/         # Exercise completion page
  ├── admin/           # Admin panel
  └── analysis/        # Results analysis page

components/
  ├── posture-detection.tsx  # Main pose detection component
  ├── ui/                    # shadcn/ui components
  └── error-boundary.tsx     # Error handling

MOCK/                   # Legacy React app (not main project)
```

### Pose Detection Component Architecture
The `PostureDetection` component (`components/posture-detection.tsx`) is the core of the application:

- **MediaPipe Integration**: Loads MediaPipe scripts dynamically from CDN
- **Camera Management**: Handles getUserMedia API, permissions, and stream management
- **Pose Analysis**: Custom validation logic for neck exercises targeting specific vertebrae
- **Real-time Feedback**: Visual indicators and progress tracking
- **Fallback System**: Simulation mode when MediaPipe fails to load
- **Exercise Tracking**: Counts repetitions and validates proper form

### Exercise System
The app contains a 12-step posture correction program focused on spinal health:
1. Neck flexibility (C1-C7 vertebrae)
2. Cerebrospinal fluid circulation
3. Head flexibility (T1-T2 vertebrae) 
4. Chest opening (T4-T5 vertebrae)
5. Back straightening (T7-T8 vertebrae)
6. Lumbar curve correction (L4-L5 vertebrae)
7. Pelvic correction (sacrum)
8. Thigh muscle release
9. Knee pain prevention
10. Calf circulation
11. Ankle circulation
12. Whole-body circulation exercise

## Important Implementation Details

### MediaPipe Loading Strategy
The pose detection system uses a sophisticated loading approach:
- Scripts loaded sequentially from jsDelivr CDN
- Retry mechanism with exponential backoff
- Graceful degradation to simulation mode on failure
- Error boundaries prevent app crashes

### Camera Permissions & Error Handling
- Comprehensive error handling for different camera access scenarios
- User-friendly error messages in Korean
- Permission request flow with clear instructions
- Fallback to simulation when camera unavailable

### Responsive Design
- Mobile-first approach optimized for Korean users
- Single-column layout (max-width: md)
- Touch-friendly interface elements
- Optimized for portrait orientation

## Configuration Files

### Next.js Configuration (`next.config.mjs`)
```javascript
// Key settings for this project
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },    // Disabled for faster builds
  typescript: { ignoreBuildErrors: true },  // Disabled for faster builds
  images: { unoptimized: true }            // For static export compatibility
}
```

### Tailwind Configuration (`tailwind.config.ts`)
- Extended color palette with CSS variables
- Custom animations for accordion components
- Sidebar-specific color scheme
- Chart color definitions

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` maps to `./*`)
- Next.js plugin included for App Router support

## Development Guidelines

### Component Patterns
- Use shadcn/ui components consistently
- Implement proper error boundaries
- Follow Next.js App Router patterns
- Use TypeScript strictly

### State Management
- React useState for local component state
- URL parameters for navigation state
- No global state management library used

### Styling Conventions
- Tailwind utility classes
- CSS variables for theme consistency
- Responsive design with mobile-first approach
- Korean typography considerations

## Testing & Deployment

### MediaPipe Testing
- Test in different browsers (Chrome, Firefox, Safari, Edge)
- Verify camera permissions across devices
- Test fallback simulation mode
- Validate pose detection accuracy

### Build Considerations
- Images are unoptimized for static deployment
- ESLint and TypeScript errors ignored during builds
- Optimized for Vercel deployment

## Korean Localization Notes
- All UI text is in Korean
- Cultural considerations for exercise instructions
- Korean typography and spacing requirements
- Time formats and measurement units in Korean standards
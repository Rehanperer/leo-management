# Mindmap Feature - Setup & Usage Guide

## Database Setup

**IMPORTANT:** Before using the mindmap feature, you need to run the database migration and seed the templates.

### Step 1: Run Migration

Run the following command to create the mindmap database tables:

```bash
npx prisma migrate dev --name add_mindmap_models
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Seed Templates (Optional but Recommended)

To add the pre-built templates, run:

```bash
psql $DATABASE_URL < prisma/seed-templates.sql
```

Or manually insert the templates using Prisma Studio (`npx prisma studio`).

## Features

### 1. **Create Mindmaps**
- Navigate to Dashboard → Mindmaps
- Click "New Mindmap"
- Enter title, description, and optionally link to a project/meeting/event
- Start from blank or choose a template

### 2. **Edit Mindmaps**
- Drag nodes to reposition them
- Click on nodes to select them
- Add new nodes using the sidebar (Task, Idea, Note, Deadline, Subtask)
- Double-click nodes to edit labels (future enhancement)
- Click checkboxes on task nodes to mark complete
- Connect nodes by dragging from one node's handle to another

### 3. **Export Options**
- **PNG**: High-quality image export
- **PDF**: Print-ready document
- **JSON**: Machine-readable data format
- **Summary Report**: Markdown structured report with hierarchy

### 4. **Search & Filter**
- Search nodes by keyword
- Filter by node type (Task, Idea, Note, Deadline, Subtask)
- View summary statistics in real-time

### 5. **Templates**
Four pre-built templates available:
- **Project Planning**: Full project lifecycle planning
- **Event Planning**: Event organization checklist
- **Meeting Agenda**: Structured meeting flow
- **Fundraising Campaign**: Fundraising strategy map

## Navigation

Access mindmaps from:
- Dashboard → Mindmaps card
- Direct URL: `/dashboard/mindmap`

## Vercel Compatibility

All features are fully compatible with Vercel:
- ✅ ReactFlow runs client-side only
- ✅ Export functions (PNG/PDF) run in browser
- ✅ Stateless API routes
- ✅ PostgreSQL database (Neon/Vercel Postgres)
- ✅ No file system dependencies

## Troubleshooting

### Issue: Nodes not draggable
- Ensure ReactFlow CSS is loaded (`import 'reactflow/dist/style.css'`)
- Check browser console for errors

### Issue: Export fails
- Canvas must be visible when exporting
- Ensure html2canvas and jspdf are installed

### Issue: Templates not showing
- Run the seed SQL script
- Check database connection in Prisma Studio

## Future Enhancements
- Real-time collaboration
- Node comments/discussion threads
- Rich text editing in nodes
- Image attachments to nodes
- Auto-layout algorithms
- Undo/redo functionality

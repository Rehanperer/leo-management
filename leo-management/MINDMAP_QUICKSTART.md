# 🚀 Quick Start - Mindmap Feature

## Initial Setup (One-Time)

### Step 1: Run Database Migration
When your database is available, run:
```bash
npx prisma migrate dev --name add_mindmap_models
```

> ⚠️ **Important:** This creates 3 new tables: `Mindmap`, `MindmapNode`, `MindmapTemplate`

### Step 2: Seed Templates (Recommended)
To add the 4 pre-built templates, use Prisma Studio:
```bash
npx prisma studio
```

Then navigate to the `MindmapTemplate` table and manually add the templates from `prisma/seed-templates.sql`, or run:
```bash
psql $DATABASE_URL < prisma/seed-templates.sql
```

---

## Usage

### Access Mindmaps
1. Navigate to http://localhost:3000/dashboard
2. Click the **"Mindmaps"** card
3. Click **"New Mindmap"** to create your first mindmap

### Create a Mindmap
1. Enter a title (required)
2. Add a description (optional)
3. Link to a project/meeting/event (optional)
4. Choose **"Start from Template"** or **"Start Blank"**

### Edit Mindmap
- **Drag nodes** to reposition
- **Click "Add Node"** buttons in sidebar
- **Click checkboxes** on tasks to mark complete
- **Connect nodes** by dragging from handle to handle
- **Search & filter** using the sidebar tools
- **Save** frequently using the Save button
- **Export** using the Export button (PNG/PDF/JSON/Summary)

---

## Features at a Glance

✅ Drag-and-drop interactive canvas  
✅ 5 node types with color coding  
✅ Task checkboxes for completion tracking  
✅ Entity linking (projects/meetings/events)  
✅ 4 pre-built templates  
✅ Real-time statistics panel  
✅ Search and filter functionality  
✅ Export to PNG, PDF, JSON, Summary  
✅ Fully Vercel compatible  

---

## Troubleshooting

**Q: Migration failed with connection error**  
A: Ensure your `DATABASE_URL` in `.env` is correct and the database is accessible. The migration can be run later when the database is available.

**Q: Templates not showing**  
A: Run the seed SQL script or manually add templates via Prisma Studio.

**Q: Nodes not draggable**  
A: This is normal first-time behavior. Refresh the page and try again.

**Q: Export not working**  
A: Ensure the canvas is visible when clicking export. Some ad blockers may interfere with downloads.

---

## Next Steps

See [MINDMAP_SETUP.md](./MINDMAP_SETUP.md) for detailed documentation.
See [walkthrough.md](file:///.gemini/antigravity/brain/688d6cc2-f75d-4287-9ed8-47f962e07ddb/walkthrough.md) for full implementation details.

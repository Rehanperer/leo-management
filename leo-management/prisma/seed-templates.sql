-- Seed data for mindmap templates
-- Run this after running the migration

INSERT INTO "MindmapTemplate" ("id", "name", "description", "category", "structure", "isPublic", "createdAt") VALUES
(
    'tpl-project-planning',
    'Project Planning',
    'Comprehensive template for planning community service projects with tasks, deadlines, and milestones',
    'project',
    '{"nodes":[{"label":"Project Central","nodeType":"idea","positionX":400,"positionY":200,"isCompleted":false,"isExpanded":true},{"label":"Planning Phase","nodeType":"task","positionX":200,"positionY":100,"isCompleted":false,"isExpanded":true,"parentId":"central"},{"label":"Execution Phase","nodeType":"task","positionX":600,"positionY":100,"isCompleted":false,"isExpanded":true,"parentId":"central"},{"label":"Budget Planning","nodeType":"subtask","positionX":100,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Volunteer Recruitment","nodeType":"subtask","positionX":300,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Venue Booking","nodeType":"deadline","positionX":500,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Photo Documentation","nodeType":"note","positionX":700,"positionY":50,"isCompleted":false,"isExpanded":true}]}',
    true,
    NOW()
),
(
    'tpl-event-planning',
    'Event Planning',
    'Organize successful events with checklist for logistics, marketing, and execution',
    'event',
    '{"nodes":[{"label":"Event Central","nodeType":"idea","positionX":400,"positionY":200,"isCompleted":false,"isExpanded":true},{"label":"Pre-Event Tasks","nodeType":"task","positionX":200,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Day-of Execution","nodeType":"task","positionX":600,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Marketing & Promotion","nodeType":"subtask","positionX":100,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Registration Setup","nodeType":"subtask","positionX":300,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Setup Checklist","nodeType":"note","positionX":500,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Event Start Time","nodeType":"deadline","positionX":700,"positionY":50,"isCompleted":false,"isExpanded":true}]}',
    true,
    NOW()
),
(
    'tpl-meeting-agenda',
    'Meeting Agenda',
    'Structure productive meetings with agenda items, action points, and follow-ups',
    'meeting',
    '{"nodes":[{"label":"Meeting Topics","nodeType":"idea","positionX":400,"positionY":200,"isCompleted":false,"isExpanded":true},{"label":"Opening Remarks","nodeType":"task","positionX":200,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Main Discussion","nodeType":"task","positionX":400,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Action Items","nodeType":"task","positionX":600,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Review Previous Minutes","nodeType":"subtask","positionX":100,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Financial Update","nodeType":"note","positionX":300,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Project Updates","nodeType":"note","positionX":500,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Next Meeting Date","nodeType":"deadline","positionX":700,"positionY":50,"isCompleted":false,"isExpanded":true}]}',
    true,
    NOW()
),
(
    'tpl-fundraising',
    'Fundraising Campaign',
    'Plan and execute fundraising campaigns with targets, strategies, and donor management',
    'fundraising',
    '{"nodes":[{"label":"Fundraising Goal","nodeType":"idea","positionX":400,"positionY":200,"isCompleted":false,"isExpanded":true},{"label":"Strategy Planning","nodeType":"task","positionX":200,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Execution & Outreach","nodeType":"task","positionX":600,"positionY":100,"isCompleted":false,"isExpanded":true},{"label":"Target Amount","nodeType":"deadline","positionX":100,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Donor List","nodeType":"note","positionX":300,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Marketing Materials","nodeType":"subtask","positionX":500,"positionY":50,"isCompleted":false,"isExpanded":true},{"label":"Thank You Notes","nodeType":"subtask","positionX":700,"positionY":50,"isCompleted":false,"isExpanded":true}]}',
    true,
    NOW()
);

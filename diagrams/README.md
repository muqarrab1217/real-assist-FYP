# Diagrams for RealAssist

This folder contains PlantUML diagrams representing the data flow, class model, and key sequence diagrams for the RealAssist frontend and how it maps to the code in this repository.

Files:
- `class_diagram.puml` - Frontend domain model and relationships (from `src/types/index.ts`).
- `dfd_level_0.puml` - High-level context diagram showing actors and external systems.
- `dfd_level_1.puml` - Level-1 DFD showing the primary flows (Auth, Leads, Payments, Chatbot).
- `sequence_login.puml` - Sequence diagram for login flow.
- `sequence_lead_classification.puml` - Sequence for lead submission + classification.
- `sequence_payment.puml` - Sequence for payments and ledger update.

How to render

1. Install PlantUML and Graphviz or use an online PlantUML renderer.
2. From VS Code you can use the PlantUML extension to preview `.puml` files.
3. To render from command-line (example):

```powershell
java -jar plantuml.jar class_diagram.puml
```

Mapping notes

- Type definitions: `src/types/index.ts`
- Mock API layer: `src/services/api.ts` (replace with real REST endpoints)
- Auth: `src/hooks/useAuth.ts`, `src/contexts/AuthContext.tsx`
- Client pages: `src/pages/Client/*`, Admin pages: `src/pages/Admin/*`
- Chatbot UI: `src/components/ui/Chatbot.tsx`
- Data extraction scripts: `pdf_extractor/*` (Python)

If you'd like, I can also generate PNG/SVG outputs for these diagrams and commit them to the repo.

# Drawsy AI

Originally hosted at [`adarshnagrikar14/drawsy-ai`](https://github.com/adarshnagrikar14/drawsy-ai), this repository was transferred to [`DrawsyAI/drawsy-ai`](https://github.com/DrawsyAI/drawsy-ai), which is now canonical.

Drawsy is an AI-powered visual workspace for drawing, planning, building, and working with connected context. It extends [Excalidraw](https://github.com/excalidraw/excalidraw) with workspace-aware AI and product workflows on an infinite canvas.

[Open Drawsy](https://drawsyai.tech) · [Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md)

## Features

- Editable Excalidraw canvas for diagrams, notes, and visual plans.
- AI assistance for inspecting and updating the active canvas or presentation.
- Projects, presentations, Kanban, Jira, and connected sources in one workspace.
- Explicit context and access controls for agent sessions.
- `DRAW.md` files rendered as editable Markdown and Mermaid canvas content.
- Local coding sessions with live application previews, plus real-time collaboration and share links.

## Repository

This repository contains the Drawsy web client and the Excalidraw monorepo it extends.

- `excalidraw-app/` — Drawsy application and product integrations.
- `packages/excalidraw/` — core Excalidraw editor.
- `packages/` — shared editor packages.
- `research/` — feature contracts and technical notes.

The hosted AI, connectors, collaboration, storage, and local-agent companion are maintained as separate services. The editor can run independently; the complete hosted product requires those services and their configuration.

## Development

Requirements: Node.js 18+ and Yarn 1.22.22.

```bash
git clone https://github.com/DrawsyAI/drawsy-ai.git
cd drawsy-ai
yarn install
yarn start
```

The app runs at `http://localhost:3001`.

Run the standard checks:

```bash
yarn test:all
yarn build
```

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report vulnerabilities privately through [SECURITY.md](./SECURITY.md).

Drawsy preserves the open, editable scene model of [Excalidraw](https://github.com/excalidraw/excalidraw). Changes to the core editor should follow upstream conventions and retain the original attribution.

## License

[MIT](./LICENSE). Excalidraw copyright and license notices remain intact.

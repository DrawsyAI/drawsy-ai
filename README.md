# Drawsy AI

Drawsy is an AI-powered visual workspace for drawing, planning, building, and working with connected context. It extends [Excalidraw](https://github.com/excalidraw/excalidraw) with workspace-aware AI and product workflows on an infinite canvas.

[Website](https://drawsyai.tech) · [Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md)

## Features

- Editable canvas for diagrams, notes, and visual plans.
- AI assistance for inspecting and updating the active canvas or presentation.
- Projects, presentations, Kanban, Jira, and connected sources.
- Explicit context and access controls for agent sessions.
- `DRAW.md` files rendered as editable Markdown and Mermaid canvas content.
- Local coding sessions with live application previews.
- Real-time collaboration and share links.

## Repository

This repository contains the Drawsy web client and the Excalidraw monorepo it extends.

- `excalidraw-app/` — Drawsy application and product integrations.
- `packages/excalidraw/` — core Excalidraw editor.
- `packages/` — shared editor packages.

AI, connector, collaboration, storage, and local-agent services are maintained separately.

## Development

Requirements: Node.js 18+ and Yarn 1.22.22.

```bash
git clone https://github.com/DrawsyAI/drawsy-ai.git
cd drawsy-ai
yarn install
yarn start
```

The app runs at `http://localhost:3001`.

Run checks with:

```bash
yarn test:all
yarn build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report security issues through [SECURITY.md](./SECURITY.md).

Drawsy is built on [Excalidraw](https://github.com/excalidraw/excalidraw); retain its attribution and license notices when modifying the editor.

## License

[MIT](./LICENSE).

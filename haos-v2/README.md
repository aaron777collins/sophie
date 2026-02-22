# Melo

A modern, privacy-focused communication platform with a Discord-like interface, powered by the Matrix protocol.

## ✨ Features

- **Discord-style UI** — Familiar server/channel navigation, rich messaging, reactions
- **Matrix Protocol** — Decentralized, federated, end-to-end encrypted
- **Voice & Video** — Powered by LiveKit for real-time communication
- **Self-hostable** — Run your own instance with full control

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Backend Protocol | Matrix (Synapse homeserver) |
| Voice/Video | LiveKit |
| Encryption | Olm/Megolm (Matrix E2EE) |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Matrix homeserver details

# Start development server
npm run dev
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## 🧪 Testing

```bash
npm run test           # Unit tests
npm run cypress:run    # E2E tests
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

### UI Design
The UI design patterns in this project were adapted from the Discord Clone tutorial:
- **Original Tutorial:** [Antonio Erdeljac](https://github.com/AntonioErdeljac) (CodeWithAntonio)
- **Reference Implementation:** [nayak-nirmalya/discord-clone](https://github.com/nayak-nirmalya/discord-clone)

We significantly modified and rebuilt the codebase to use the Matrix protocol instead of the original Prisma/Clerk stack.

### Matrix Protocol
This project uses the [Matrix](https://matrix.org) open standard for decentralized communication:
- **matrix-js-sdk** — [Apache License 2.0](https://github.com/matrix-org/matrix-js-sdk) — Copyright © Matrix.org Foundation

### Voice & Video
- **LiveKit** — [Apache License 2.0](https://github.com/livekit/client-sdk-js) — Copyright © LiveKit, Inc.

### UI Components
- **shadcn/ui** — Built on [Radix UI](https://www.radix-ui.com/) primitives
- **Tailwind CSS** — [MIT License](https://github.com/tailwindlabs/tailwindcss)

---

**Made with 💜 by Aaron Collins**

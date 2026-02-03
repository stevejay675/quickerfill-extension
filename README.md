# quickerfill-extension

A small, fast browser extension to speed up form-filling (autofill) and streamline repetitive input tasks. QuickerFill helps you quickly populate forms with saved presets and smart field detection — configurable, privacy-minded, and keyboard-friendly.

> NOTE: This README is a template. Replace the placeholders (⟨like this⟩) with project-specific details — feature list, screenshots, installation/build commands, author, license, etc.

## Table of contents

- [Features](#features)
- [Installation](#installation)
  - [User install (Chrome / Chromium / Edge / Firefox)](#user-install)
  - [Developer install (load unpacked)](#developer-install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Common commands](#common-commands)
- [Testing](#testing)
- [Packaging & Publishing](#packaging--publishing)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Support / Contact](#support--contact)

## Features

- Save and manage multiple autofill profiles/presets
- Smart field matching (by `name`, `id`, `placeholder`, and heuristics)
- One-click fill for common forms (address, name, email, credit card — if enabled)
- Keyboard shortcuts for quick access
- Export / import profiles (JSON)
- Local-only storage by default — no external servers (privacy-first)
- Lightweight and performant

(Adjust or remove features above to match the actual extension functionality.)

## Installation

### User install (Chrome / Chromium / Edge / Firefox)
Option 1 — Chrome Web Store / Firefox Add-ons:
1. Visit the extension listing (⟨link to store⟩) and click "Add to Chrome" / "Add to Firefox".

Option 2 — Install from local build (unpacked):
1. Build the extension (see Development below).
2. Open your browser's extension page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox (about:debugging → This Firefox → Load Temporary Add-on)
3. Enable "Developer mode" (Chrome/Edge) and click "Load unpacked".
4. Select the `dist/` or `build/` folder created by the build command.

### Developer install (load unpacked)
- Follow the "Install from local build" steps above after running the build process.

## Usage

- Click the extension icon to open the QuickerFill popup.
- Select a profile to autofill the current page’s form fields.
- Use keyboard shortcut ⟨Ctrl/Cmd+Shift+F⟩ (customizable) to open the popup quickly.
- Manage profiles from the settings page: create, edit, import/export, and set defaults.

(Adjust shortcuts and behavior according to your implementation.)

## Configuration

- Profiles are stored locally (IndexedDB / chrome.storage / browser.storage.local).
- To configure keyboard shortcuts:
  - Chrome: `chrome://extensions/shortcuts`
  - Firefox: about:addons → Extensions → Manage Your Extension → Preferences → Shortcuts
- Optional settings:
  - Auto-detect forms: On / Off
  - Allow autofill on insecure pages: Yes / No
  - Fields to ignore: `["password", "cc-number", ...]`

(Describe actual configuration keys and defaults used by your extension.)

## Development

### Prerequisites

- Node.js >= 16 (or your project's version)
- npm or yarn / pnpm
- Chrome/Chromium or Firefox for testing

### Common commands

Replace the commands below with the actual scripts in your package.json.

- Install dependencies
  - npm: `npm install`
  - yarn: `yarn`
  - pnpm: `pnpm install`

- Run a development build / live reload (if available)
  - `npm run dev`

- Build production artifacts
  - `npm run build`

- Lint
  - `npm run lint`

- Format
  - `npm run format`

- Run tests
  - `npm test`

- Package zip for store upload (example)
  - `npm run package`

If you use a bundler (Webpack / Vite / Rollup), include its configuration location and notes here.

## Testing

- Unit tests: Location — `tests/` or `src/__tests__/`
- E2E testing approach (optional): Puppeteer / Playwright to load unpacked extension & interact with pages.
- Browser-extension-specific testing notes:
  - Use `web-ext` for Firefox testing: `npx web-ext run --source-dir=dist`
  - For automated Chrome testing, use Puppeteer to launch Chrome with unpacked extension.

## Packaging & Publishing

- Chrome Web Store:
  - Create zip of `dist/` or `build/` output
  - Upload to the Chrome Web Store dashboard
  - Supply icons, screenshots, and privacy policy
- Firefox Add-ons:
  - Use `web-ext` or the Add-ons Developer Hub to upload and sign

Include store listing links and any specific store submission steps your project requires.

## Contributing

Thanks for considering contributing! Please follow these steps:

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and run tests/lint/format
3. Open a pull request describing your change
4. Fill in the PR template (if present) and link relevant issues

Guidelines:
- Keep PRs small and focused
- Include tests for new behaviors
- Follow the existing code style (ESLint / Prettier configs)

If you have a CONTRIBUTING.md in the repo, link to it here.

## Roadmap

- [ ] Multi-profile sync (opt-in)
- [ ] Better heuristics for field matching (ML/heuristic improvements)
- [ ] Import from common password managers / CSV templates
- [ ] Internationalization (i18n) support

(Replace with your project's actual roadmap items.)

## License

This project is licensed under the ⟨LICENSE NAME⟩ — see the [LICENSE](LICENSE) file for details.

## Support / Contact

For questions or support, open an issue in this repository or contact ⟨your email or handle⟩.

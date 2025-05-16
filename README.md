# Proactive Chatbot

A relentless digital companion that never sleeps and always knows when to interrupt you at the most inconvenient moments. 

## Why suffer in silence when you can have a chatbot that:

- Never misses an opportunity to remind you of your upcoming deadlines
- Expertly predicts when you're about to forget something important
- Has a keen sense of timing for when you're "most productive"
- Never lets you enjoy a moment of peace without checking if you're "being productive"
- Has a special talent for finding the most awkward moments to ask "How's your day going?"

## Features

- Real-time chat with modern interface
- Context-based proactive notification system
- Progressive user learning
- Integration with free generative AI
- Reminder and calendar system
- Intuitive user interface with Material-UI

## Technologies

- Frontend:
  - React with TypeScript
  - Vite as bundler
  - Material-UI for components
  - TanStack React Query for state management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nantes/proactive-chatbot.git
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Usage

1. Start a conversation with the chatbot
2. The bot will learn from your preferences and conversation patterns
3. You will receive proactive notifications based on context
4. You can configure your notification preferences in the settings menu

## Contributing

1. Create a feature branch:
```bash
git checkout -b feature/AmazingFeature
```

2. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```

3. Push to the branch:
```bash
git push origin feature/AmazingFeature
```

4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

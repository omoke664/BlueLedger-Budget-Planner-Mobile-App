# Contributing to BlueLedger

Thank you for your interest in contributing to BlueLedger! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional atmosphere

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/blueledger.git
   cd blueledger
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your development environment** (see README.md)
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Process

### Before You Start

- Check existing issues and pull requests to avoid duplication
- Open an issue to discuss major changes before implementing
- Ensure you understand the project's architecture and design patterns

### While Developing

- Write clean, readable code that follows the project patterns
- Test your changes thoroughly across different screen sizes
- Ensure accessibility compliance
- Add comments for complex logic
- Update documentation as needed

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug fixes**: Fix issues and improve stability
- **✨ New features**: Add functionality that enhances the user experience
- **📚 Documentation**: Improve README, add code comments, create guides
- **🎨 UI/UX improvements**: Enhance the design and user interface
- **🔧 Performance**: Optimize code and improve app performance
- **🧪 Testing**: Add or improve test coverage

## 📝 Code Style Guidelines

### General Principles

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Prefer functional components with hooks
- Keep components small and focused
- Use descriptive variable and function names

### React/TypeScript

```typescript
// ✅ Good - Descriptive interface names
interface TransactionFormProps {
  transaction?: Transaction;
  onSave: (data: TransactionData) => void;
  onCancel: () => void;
}

// ✅ Good - Functional component with proper typing
export function TransactionForm({ transaction, onSave, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionData>({
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    // ...
  });

  // Component logic here
}
```

### Styling

- Use Tailwind CSS classes following the design system
- Utilize CSS custom properties from `styles/globals.css`
- Follow the 8px grid system for spacing
- Use semantic class names for custom styles

```tsx
// ✅ Good - Using design system classes
<div className="p-grid-3 bg-card border border-border rounded-lg">
  <h2 className="text-foreground font-medium">Title</h2>
  <p className="caption text-muted-foreground">Description</p>
</div>
```

### File Organization

```
components/
├── screens/           # Page-level components
├── ui/               # Reusable UI components (shadcn/ui)
├── [FeatureComponent.tsx]  # Feature-specific components
└── [SharedComponent.tsx]   # Shared utility components
```

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): brief description

More detailed explanation if needed

- Additional bullet points if necessary
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(analytics): add spending trends line chart
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(dashboard): improve mobile responsiveness
refactor(api): simplify transaction service
```

## 🔍 Pull Request Process

1. **Update your branch** with the latest main branch:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure your code follows the guidelines**:
   - Code style is consistent
   - No console errors or warnings
   - Responsive design works on mobile and desktop
   - Accessibility standards are met

3. **Write a clear PR description**:
   - Explain what changes you made and why
   - Include screenshots for UI changes
   - Reference any related issues
   - List any breaking changes

4. **PR Template**:
   ```markdown
   ## What does this PR do?
   Brief description of the changes

   ## Screenshots (if applicable)
   [Include screenshots for UI changes]

   ## Related Issues
   Fixes #123

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Responsive design tested
   - [ ] No console errors
   - [ ] Documentation updated
   ```

5. **Wait for review**:
   - Be responsive to feedback
   - Make requested changes promptly
   - Ask questions if feedback is unclear

## 🐛 Issue Guidelines

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if it's already been fixed in the latest version
- Gather relevant information (browser, device, steps to reproduce)

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/device information
- Screenshots or screen recordings
- Console errors (if any)

### Feature Requests

Include:
- Clear, descriptive title
- Use case and motivation
- Detailed description of the proposed feature
- Mockups or examples (if applicable)
- Consideration of potential impact

### Questions and Support

For questions about using BlueLedger:
- Check the README and documentation first
- Search existing issues and discussions
- Provide context about what you're trying to accomplish

## 🎯 Areas for Contribution

We're particularly interested in contributions in these areas:

- **📊 Enhanced Analytics**: More chart types, advanced filtering
- **💰 Budget Features**: Goal setting, spending predictions
- **🔔 Notifications**: Budget alerts, spending reminders
- **📱 Mobile Experience**: Performance optimizations, gesture support
- **🌐 Internationalization**: Multi-language support
- **♿ Accessibility**: WCAG compliance, screen reader support
- **🧪 Testing**: Unit tests, integration tests, E2E tests

## 🤔 Questions?

If you have questions about contributing:

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the documentation

Thank you for contributing to BlueLedger! 🙏
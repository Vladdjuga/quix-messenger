# Commit Message Guide with Emojis

### This guide outlines our standards for writing clear and consistent Git commit messages using the Conventional Commits specification with emojis.


---


## Format


### Each commit message should follow this format:


```Markdown

<emoji> <type>(<scope>): <subject>

```

---


## Commit Types & Emojis

| Emoji | Type | Description |
| :---: | :--- | :--- |
| ✨ | `feat` | A new feature |
| 🐛 | `fix` | A bug fix |
| 📚 | `docs` | Documentation only changes |
| 💄 | `style` | Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc) |
| ♻️ | `refactor`| A code change that neither fixes a bug nor adds a feature |
| ✅ | `test` | Adding missing tests or correcting existing tests |
| ⚙️ | `chore` | Other changes that don't modify src or test files |
| ⚡️ | `perf` | A code change that improves performance |
| 📦 | `build` | Changes that affect the build system or external dependencies |
| 🚦 | `ci` | Changes to our CI configuration files and scripts |
| ⏪️ | `revert` | Reverts a previous commit |

## Examples

 - ✨ feat: add user authentication

 - 🐛 fix: correct login button alignment

 - 📚 docs: update README.md with new instructions

 - ♻️ refactor(auth): simplify user validation logic
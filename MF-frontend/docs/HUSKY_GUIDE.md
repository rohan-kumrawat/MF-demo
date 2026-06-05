# 🐕 Husky & Git Workflow Guide

This project uses **Husky** and **lint-staged** to ensure code quality and consistency before code reaches the repository.

## 🛠️ Why Husky?

Husky automatically runs scripts at key points in your Git workflow:
- **Pre-commit**: Checks and formats your code automatically.
- **Pre-push**: Ensures the project builds and types are correct before pushing to GitHub.

---

## 📋 How to Use

### 1. Committing Code (`pre-commit`)
When you run `git commit`, Husky triggers `lint-staged`.
- **What it does**: 
    - Runs `eslint --fix` on your changed files.
    - Runs `prettier --write` to format the code.
- **Outcome**: 
    - If errors are found that cannot be auto-fixed, the commit will **fail**. You must fix the errors and try again.
    - If everything is clean, your code is formatted and committed.

### 2. Pushing Code (`pre-push`)
When you run `git push`, Husky triggers `npm run build`.
- **What it does**: 
    - Runs `tsc -b` (TypeScript type check).
    - Runs `vite build`.
- **Outcome**: 
    - If there are TypeScript errors or the build fails, the push will be **blocked**.
    - This prevents broken code from ever reaching the main branch.

---

## 🚀 Best Practices

1.  **Don't bypass the hooks**: Avoid using `--no-verify` unless absolutely necessary (e.g., an urgent fix that doesn't affect production code).
2.  **Keep it clean**: If `lint-staged` fails, read the terminal output carefully. It will tell you exactly which line in which file caused the issue.
3.  **Local validation**: Run `npm run lint` or `npm run build` manually before committing if you've made large changes. This saves time.
4.  **Husky errors on Windows**: If you get "cannot execute binary file" errors, it's usually due to file encoding (UTF-16 vs UTF-8). Ensure hooks are saved as **UTF-8 (Plain)**.

---

## 🛠️ Troubleshooting

### "lint-staged could not find any staged files"
This is a warning, not an error. It just means you didn't change any `.ts` or `.tsx` files in that specific commit. The commit still succeeds.

### "cannot execute binary file"
This happens if the hook file encoding is wrong. To fix it, recreate the file in a code editor (like VS Code) and ensure the encoding is set to **UTF-8**.

### Bypassing hooks (Emergency only)
```bash
git commit -m "Emergency fix" --no-verify
git push --no-verify
```

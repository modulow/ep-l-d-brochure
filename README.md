# EP L&D Brochure

Static browser version of the L&D Catalogue 2026.

## Publish with GitHub Pages

1. Create a repository on the `modulow` GitHub account.
2. Recommended repository name: `ep-l-d-brochure`.
   GitHub repository names usually should avoid `&`, even if this local folder is named `ep-l&d-brochure`.
3. Upload all files from this folder to the repository root.
4. In GitHub, open `Settings` > `Pages`.
5. Set `Source` to `Deploy from a branch`.
6. Select branch `main` and folder `/root`.
7. The public URL will be:

```text
https://modulow.github.io/ep-l-d-brochure/
```

## Notes

- The catalogue runs as a static HTML/CSS/JS site.
- The current admin/login/edit features use browser localStorage, so edits are local to each browser.
- For shared editing by many users, add a backend/database later.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the ward roster and clinical calculation helpers in a browser-safe data module, separate from the workspace UI, so filters and inspection share one source of truth.
- The current ward is explicitly a demo with session-only vitals; never imply clinical records are saved without a connected persistence service.
- Use the root layout for the single main landmark and leaf routes for page-specific metadata.

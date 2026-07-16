# Shell helper: `wt`

A single `wt` command whose subcommands mirror `git worktree`'s own verbs (`add`, `list`, `remove`, `prune`), plus a bare `wt <slug>` jump shortcut. Add to `~/.zshrc`, then `source ~/.zshrc`.

```zsh
# ── wt: shorthand over `git worktree`, plus a jump shortcut ────────
# Subcommands mirror git's own verbs so there's nothing new to learn:
#   wt add <type> <slug>   create a worktree (branch off the repo default, link deps, copy .env*)
#   wt remove <slug>       (alias: rm)   remove a worktree
#   wt list                (alias: ls)   list worktrees
#   wt prune               prune stale worktree metadata
#   wt <slug>              jump to the worktree matching <slug> (bare `wt` = fzf picker)
wt() {
  case "$1" in
    add)             shift; _wt_add "$@" ;;
    remove|rm)       shift; _wt_remove "$@" ;;
    list|ls)         git worktree list ;;
    prune)           git worktree prune ;;
    help|-h|--help)  echo "wt [add <type> <slug> | remove <slug> | list | prune | <slug>]" ;;
    *)               _wt_jump "$@" ;;     # bare wt / wt <slug> = jump
  esac
}

# jump to a worktree of the current repo: bare = fzf picker, <slug> = first match.
_wt_jump() {
  local dir
  if [ -n "$1" ]; then
    dir=$(git worktree list 2>/dev/null | awk '{print $1}' | grep -i "$1" | head -1)
    if [ -z "$dir" ]; then
      echo "wt: no worktree matching '$1'" >&2
      return 1
    fi
  else
    dir=$(git worktree list 2>/dev/null | fzf --prompt="worktree> " | awk '{print $1}')
    [ -z "$dir" ] && return 1
  fi
  cd "$dir"
}

# ── which folder to link for each project type ─────────────────────
# One line per type:  "<file that identifies the project>  <folder to link>"
# Want a new language? Add one line. That's the whole change.
WTNEW_DEPS=(
  "package.json      node_modules"
  "pyproject.toml    .venv"
  "requirements.txt  .venv"
  "go.mod            vendor"
  "Cargo.toml        target"
)

# symlink the main tree's dependency dir into a new worktree so it doesn't
# reinstall. Reads the WTNEW_DEPS table above — no need to touch this.
_wt_link_deps() {  # $1=main_root  $2=target
  local main_root="$1" target="$2" line marker depdir
  for line in "${WTNEW_DEPS[@]}"; do
    marker="${line%% *}"        # the file before the spaces
    depdir="${line##* }"        # the folder after the spaces
    if [ -f "$main_root/$marker" ] && [ -d "$main_root/$depdir" ]; then
      ln -s "$main_root/$depdir" "$target/$depdir"
      return                    # linked one, done
    fi
  done
  # no match / no dep folder → link nothing (no broken symlink)
}

# create a new worktree, consistently: branch off the repo default, symlink deps
# and copy .env* from the main tree, cd into it. Usage: wt add <type> <slug>  e.g. wt add feat schedule-list-fix
_wt_add() {
  if [ $# -lt 2 ]; then
    echo "usage: wt add <type> <slug>   (type: feat|fix|bug|chore|va)" >&2
    return 1
  fi
  local type="$1" slug="$2"
  local main_root target
  main_root=$(git worktree list 2>/dev/null | head -1 | awk '{print $1}')
  if [ -z "$main_root" ]; then
    echo "wt add: not inside a git repo" >&2
    return 1
  fi
  target="$(dirname "$main_root")/$(basename "$main_root")-${slug}"

  # base branch = the repo's default (origin/HEAD), else whatever main has checked out
  local base
  base=$(git -C "$main_root" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
  base=${base#origin/}
  [ -z "$base" ] && base=$(git -C "$main_root" symbolic-ref --short HEAD 2>/dev/null)

  git -C "$main_root" worktree add "$target" -b "${type}/${slug}" "$base" || return 1
  _wt_link_deps "$main_root" "$target"
  # .env* are gitignored, so the checkout won't carry them over
  for f in "$main_root"/.env*(N); do
    cp "$f" "$target/"
  done
  cd "$target"
  echo "worktree ready: $target (branch ${type}/${slug}), deps symlinked, .env* copied"
}

# remove a worktree by slug. Never touches the main worktree; steps you back to
# it first if you're standing inside the one being removed. Usage: wt remove <slug>
_wt_remove() {
  if [ -z "$1" ]; then
    echo "usage: wt remove <slug>" >&2
    return 1
  fi
  local main_root dir
  main_root=$(git worktree list 2>/dev/null | head -1 | awk '{print $1}')
  # candidates exclude the first line (the main worktree) so it can't be removed
  dir=$(git worktree list 2>/dev/null | tail -n +2 | awk '{print $1}' | grep -i "$1" | head -1)
  if [ -z "$dir" ]; then
    echo "wt remove: no removable worktree matching '$1'" >&2
    return 1
  fi
  case "$PWD/" in "$dir/"*) cd "$main_root" ;; esac
  git worktree remove "$dir" && echo "removed worktree: $dir"
}
```

## Notes

- **Multi-language.** Which dependency folder gets symlinked is driven by the `WTNEW_DEPS` table — Node (`node_modules`), Python (`.venv`), Go (`vendor`), Rust (`target`) out of the box. To support another language, add one `"<marker-file>  <folder>"` line; nothing else changes. If a project matches nothing, no symlink is made (no broken links).
- **`.env*` is copied, not symlinked** — each worktree gets its own copy so tweaking env vars in one doesn't leak into the others.
- `wt` requires `fzf` only for the no-argument interactive picker (`which fzf` to check; install if missing). Everything else needs nothing beyond git.

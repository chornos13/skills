# Shell helper: `wt`

A single `wt` command whose subcommands mirror `git worktree`'s own verbs (`add`, `list`, `remove`, `prune`), plus a bare `wt <slug>` jump shortcut. Add to `~/.zshrc`, then `source ~/.zshrc`.

```zsh
# ── wt: shorthand over `git worktree`, plus a jump shortcut ────────
# Subcommands mirror git's own verbs so there's nothing new to learn:
#   wt add <type> <slug>   create a worktree (branch off the current branch, link deps, copy .env*)
#   wt remove [slug]       (alias: rm)   remove a worktree (fzf-pick if no/ambiguous slug; confirms first)
#   wt list                (alias: ls)   list worktrees
#   wt prune               prune stale worktree metadata
#   wt <slug>              jump to the worktree matching <slug> (bare `wt` = fzf picker)
wt() {
  case "$1" in
    add)             shift; __wt_add "$@" ;;
    remove|rm)       shift; __wt_remove "$@" ;;
    list|ls)         git worktree list ;;
    prune)           git worktree prune ;;
    help|-h|--help)  echo "wt [add <type> <slug> | remove [slug] | list | prune | <slug>]" ;;
    *)               __wt_jump "$@" ;;    # bare wt / wt <slug> = jump
  esac
}

# jump to a worktree of the current repo: bare = fzf picker, <slug> = first match.
__wt_jump() {
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

# give a new worktree the main tree's dependency dir so it doesn't reinstall.
#
# ── which folder to share for each project type, and how ───────────
# One line per type:  "<file that identifies the project>  <folder>  <link|copy>"
# Want a new language? Add one line. That's the whole change.
#
#   link = symlink the main tree's folder. Instant, but the two trees share one
#          directory, so writes in the worktree land in the main tree.
#   copy = cp -al, a hardlink farm: real directories, file contents shared.
#          node_modules needs this for two reasons. Turbopack rejects any
#          symlink resolving outside the project root, and worktrees live in a
#          *sibling* directory, so a symlinked node_modules is always out of
#          root — Next 16 dies at startup with "Symlink node_modules is
#          invalid, it points out of the filesystem root". It also stops
#          `yarn add` in a worktree from silently rewriting the main tree's
#          node_modules. Costs directories only (~22MB for a 5.5k-dir tree);
#          file contents are shared, not duplicated.
#
# .venv/target stay on link deliberately: a venv hardcodes absolute paths in
# pyvenv.cfg and bin/activate, so a copy would look independent while still
# pointing at the original, and cargo rewrites target/ in place.
__wt_link_deps() {  # $1=main_root  $2=target
  local -a deps=(
    "package.json      node_modules  copy"
    "pyproject.toml    .venv         link"
    "requirements.txt  .venv         link"
    "go.mod            vendor        link"
    "Cargo.toml        target        link"
  )
  local main_root="$1" target="$2" line
  local -a f
  [ -n "$main_root" ] && [ -n "$target" ] || return 1   # guard the rm -rf below
  for line in "${deps[@]}"; do
    f=(${=line})                # split on whitespace: marker, depdir, mode
    if [ -f "$main_root/$f[1]" ] && [ -d "$main_root/$f[2]" ]; then
      # Already present in the checkout (committed by mistake, or left behind)?
      # Leave it alone: `cp -al` would nest it as node_modules/node_modules.
      if [ -e "$target/$f[2]" ]; then
        echo "wt: $f[2] already exists in the worktree — left as is." >&2
        return
      fi
      if [ "$f[3]" = copy ] && cp -al "$main_root/$f[2]" "$target/$f[2]" 2>/dev/null; then
        return                  # hardlinked, done
      fi
      if [ "$f[3]" = copy ]; then
        # cp -al only works within one filesystem. Fall back rather than leave
        # the worktree with no deps, but say so — Turbopack will reject this.
        rm -rf "$target/$f[2]"  # clear any half-finished copy
        echo "wt: hardlinking $f[2] failed (different filesystem?) — symlinked instead." >&2
        echo "    Turbopack will refuse this; run a real install in the worktree." >&2
      fi
      ln -s "$main_root/$f[2]" "$target/$f[2]"
      return                    # handled one, done
    fi
  done
  # no match / no dep folder → link nothing (no broken symlink)
}

# create a new worktree, consistently: branch off the current active branch, link deps
# and copy .env* from the main tree, cd into it. Usage: wt add <type> <slug>  e.g. wt add feat schedule-list-fix
__wt_add() {
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

  # base branch = whatever branch is currently checked out (the active branch),
  # so worktrees stack off wherever you are — not hard-wired to main/master.
  # Fall back to the repo default (origin/HEAD) only when HEAD is detached.
  local base
  base=$(git symbolic-ref --short HEAD 2>/dev/null)
  if [ -z "$base" ]; then
    base=$(git -C "$main_root" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)
    base=${base#origin/}
  fi

  git -C "$main_root" worktree add "$target" -b "${type}/${slug}" "$base" || return 1
  __wt_link_deps "$main_root" "$target"
  # .env* are gitignored, so the checkout won't carry them over
  setopt local_options null_glob
  for f in "$main_root"/.env*; do
    cp "$f" "$target/"
  done
  cd "$target"
  echo "worktree ready: $target (branch ${type}/${slug}), deps linked, .env* copied"
}

# remove a worktree. Never touches the main worktree; steps you back to it first
# if you're standing inside the one being removed. Always confirms before removing.
# Usage: wt remove [slug]
#   wt remove            fzf-pick from the removable worktrees
#   wt remove <slug>     pick the first match; if several match, fzf-pick among them
__wt_remove() {
  local main_root dir
  main_root=$(git worktree list 2>/dev/null | head -1 | awk '{print $1}')
  if [ -z "$main_root" ]; then
    echo "wt remove: not inside a git repo" >&2
    return 1
  fi

  # candidates exclude the first line (the main worktree) so it can't be removed
  local candidates
  candidates=$(git worktree list 2>/dev/null | tail -n +2)
  if [ -z "$candidates" ]; then
    echo "wt remove: no removable worktrees (only the main tree exists)" >&2
    return 1
  fi

  if [ -n "$1" ]; then
    candidates=$(echo "$candidates" | grep -i "$1")
    if [ -z "$candidates" ]; then
      echo "wt remove: no removable worktree matching '$1'" >&2
      return 1
    fi
  fi

  # one candidate → take it; several (or no slug) → fzf picker
  if [ "$(echo "$candidates" | wc -l)" -eq 1 ]; then
    dir=$(echo "$candidates" | awk '{print $1}')
  else
    if ! command -v fzf >/dev/null 2>&1; then
      echo "wt remove: multiple matches; install fzf to pick, or pass a more specific slug" >&2
      echo "$candidates" >&2
      return 1
    fi
    dir=$(echo "$candidates" | fzf --prompt="remove worktree> " | awk '{print $1}')
    [ -z "$dir" ] && return 1   # picker cancelled
  fi

  # confirm before removing
  printf "remove worktree '%s'? [y/N] " "$dir"
  local reply
  read -r reply
  case "$reply" in
    y|Y|yes|YES) ;;
    *) echo "wt remove: cancelled"; return 1 ;;
  esac

  case "$PWD/" in "$dir/"*) cd "$main_root" ;; esac
  git worktree remove "$dir" && echo "removed worktree: $dir"
}
```

## Notes

- **Multi-language.** Which dependency folder gets shared is driven by the `deps` table inside `__wt_link_deps` — Node (`node_modules`), Python (`.venv`), Go (`vendor`), Rust (`target`) out of the box. To support another language, add one `"<marker-file>  <folder>  <link|copy>"` line; nothing else changes. If a project matches nothing, nothing is created (no broken links).
- **`node_modules` is hardlinked (`copy`), not symlinked.** Two reasons, and the first one is fatal rather than cosmetic:
  - **Turbopack refuses out-of-root symlinks.** Worktrees are created as a *sibling* of the main tree, so a symlinked `node_modules` always resolves outside the project root. Next 16 (where Turbopack is the default for both `dev` and `build`) aborts at startup with `TurbopackInternalError: Symlink node_modules is invalid, it points out of the filesystem root`. Webpack projects are unaffected, which is why this stayed hidden until a Next 16 upgrade.
  - **A symlink makes the two trees share one directory.** `yarn add` in a worktree writes into the *main* tree's `node_modules` while updating only the worktree's `package.json`/lockfile — main ends up with packages its manifest doesn't declare. Hardlinking gives each worktree real directories, so adds and removes stay local.

  Cost is directories only — measured on a 1.1 GB / 59,794-file `node_modules`: **+22 MB and 0.7s**, of which ~22 MB is the 5,512 directories (directories can't be hardlinked) and ~0.6 MB is filenames. File contents are shared, contributing zero. Compare a real `yarn install` per worktree at 1.1 GB.

  The one hazard is tools that patch files **in place** inside `node_modules` (e.g. `patch-package`), since shared inodes mean the edit hits both trees. npm/yarn installs are safe — they unlink and replace, which breaks the link first. If a project uses `patch-package`, run a real install in that worktree.
- **`cp -al` requires one filesystem.** Worktrees are siblings of the main tree, so this holds in practice; if it ever fails, `wt` falls back to a symlink and warns that Turbopack will reject it.
- **`.env*` is copied, not symlinked** — each worktree gets its own copy so tweaking env vars in one doesn't leak into the others.
- **Keep the `__` prefix and the inlined `deps` table.** Some agent shells replay a captured snapshot of `~/.zshrc` instead of sourcing it, and the snapshot drops single-underscore functions (taken for completions) and arrays. A `_wt_add` helper or a global table is missing there, so `wt add` fails while `wt list` keeps working. Double underscores and a `local -a` table inside the function survive.
- `wt` requires `fzf` for the interactive pickers — bare `wt` (jump) and `wt remove` with no/ambiguous slug (`which fzf` to check; install if missing). A `wt remove <slug>` that matches exactly one worktree needs nothing beyond git.
- **`wt remove` always confirms.** After a worktree is chosen (by slug or picker) it prompts `remove worktree '<path>'? [y/N]` and only proceeds on `y`/`yes`; anything else cancels. The main worktree is never a candidate.

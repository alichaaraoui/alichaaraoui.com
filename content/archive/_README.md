# Archive

Everything here shows on /archive, newest first.

Each folder is a kind, and a kind is a filter: `sketches/`, `ideas/`, or make
a new folder (`models/`, `references/` ...) and it appears as its own pill.
Finished projects from content/work show up on their own under "works".

- Drop a picture or a clip in a folder and it is an entry. Its filename is the
  title, minus any leading number.
- Add a `.md` with the same name to give it more:

  ```
  ---
  title: Facade study
  year: 2026
  tags: facade, growth          # each tag becomes a filter
  link: /work/differential-growth   # optional, the entry opens this instead
  order: 1                      # optional, sorts within a year
  ---
  A line or two about it.
  ```

- A `.md` with no picture beside it is a written entry: an idea.

Files and folders starting with `_` or `.` are ignored.

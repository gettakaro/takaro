# Ui

Ui is a package that does not run on its own and the core should always be included with other packages.

The dockerfiles however contain the storybook build.

# Note

Keep typescript at 4.2.2. Otherwise storybook-docgen will not work.
Could maybe be fixed by upgrading all the plugins, but cba atm, it is too fragile :)

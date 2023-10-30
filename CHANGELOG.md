# Change Log

All notable changes to the "silverfin-development-toolkit" extension will be documented in this file.

## [1.13.1]

- Remove conflicting keybinding for "Silverfin: verify liquid syntax (linter)"

## [1.13.0]

- Fix HTML panel view when running a liquid test

## [1.12.0]

- Update liquid testing JSON schema

## [1.11.1]

- Update `tr` element snippet to align it with `table` and include two `td` with classes.

## [1.11.0]

- Display the firm name next to the firm id in the sidebar

## [1.10.5]

- Update liquid language configuration

## [1.10.4]

- Reload the stored credentials when needed. It was only done when the extension was loaded previously.

## [1.10.3]

- Update dependencies. silverfin-cli v1.15.5

## [1.10.2]

- Fix dependency on third-party auto-close extension that would block update of the extension on WSL by adding this functionality to the extension itself.

## [1.10.1]

- Updated documentation

## [1.10.0]

- Check if the included shared parts in the liquid code exists or not, and if they are added to the template configuration or not. Create diagnostics for this and also a quick-fix to add the shared part to the template configuration.

## [1.9.0]

- New command to authorize a firm from the Extension.

## [1.8.5]

- Reload every panel in the sidebar when a file get's saved (before it was only when the user switch tabs)

## [1.8.4]

- Reload the Firms panel in the sidebar when the user changes the firm id (using the command `Silverfin: Change Firm Id`)

## [1.8.0]

- Introduce a Side-Bar panel. Display information about parts, shared parts, template configuration and firm ids authorized.

## [1.7.0]

- Introduce Quick-Fixes

## [1.6.2]

- Remove functionality introduced in v1.5.0.

## [1.6.0]

- Run linter using Silverfin API on liquid files.

## [1.5.0]

- Dynamically compare the Error's list from the the last test run with the content of the file. When the file is updated to solve the issue, the error should be gone from the interface (but it is still stored)

## [1.4.3]

- Update dependencies. Sf-toolkit to v1.5.2

## [1.4.2]

- Update dependencies. Sf-toolkit to v1.5.1

## [1.4.1]

- Update sf-toolkit to v1.4.1
- Output channel: extra logging when test run fails. Close/Prevent HTML panel

## [1.4.0]

- HTML render of templates inside Visual Studio Code while running a Liquid Test

## [1.2.0]

- Schema for Liquid Tests updated

## [1.1.1]

- Updated wrong link in README

## [1.1.0]

- Show only the statusBar icon when there is a YAML file opened in the activeTab

## [1.0.0]

- Added SF-Toolkit added as a dependency.
- Run your Liquid Tests from the Extension.
- Visualize Liquid Test's output in the YAML files.

## [0.0.3]

- Replaced path for the JSON Schema (from a local file to an external file). This change will make the schema read-only for users.

## [0.0.2]

- Local paths for schemas and snippets (`src` directory was omitted when publishing).

## [0.0.1]

- Added JSON Schema for liquid test written in YAML.
- Added YAML Code snippet of a sample test.
- Added Red Hat's YAML extension dependency.

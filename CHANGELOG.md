# Change Log

All notable changes to the "silverfin-development-toolkit" extension will be documented in this file.

## [1.19.3]

- Bump Silverfin CLI version (1.30.3 -> 1.31.0)

## [1.19.2]

- Bump Silverfin CLI version (1.28.2 -> 1.30.0)

## [1.19.1]

- Bump Silverfin CLI version (1.27.1 -> 1.27.3)

## [1.19.0]

- Restructure snippets/ refactor README, and complete filter snippets

## [1.18.3]

- Bump Silverfin CLI version (1.26.14 -> 1.26.15)

## [1.18.2]

- Bump Silverfin CLI version (1.26.12 -> 1.26.14)

## [1.18.1]

- Bump Silverfin CLI version (1.26.10 -> 1.26.12)

## [1.18.0]

- Check if text parts included in liquid code exists and are properly added to `config.json` of the template.
- Fix shared part included regular expression. It was not considering optional arguments. Match shared part parts with optional arguments.

## [1.17.0]

- Add snippets for drops and filters, and expanding existing snippets, alongisde refactoring documentation

## [1.16.5]

- Fix so different expectation errors in liquid test results are added correctly from quick fixes
   
## [1.16.4]

- Fix issue where a wrong list of shared parts was shown if the current default firm ID did not exist in the config of a template

## [1.16.3]

- Some really large YAMLs contained too many aliases that reached the limit and caused the document to no longer be parsed. Increased the limit so it aligns with the limit in the CLI and it can support very large YAMLs
- When restarting the VS Code, the "Problems" panel for a template gets cleared so previous liquid testing errors don't keep popping up there

## [1.16.2]

- Fix shared parts management from sidebar

## [1.16.1]

- Fix shared parts Quick Fix
 
## [1.16.0]

- New command to run Silverfin CLI commands in bulk. Create, update, import, add shared part, remove shared part, get template id.

## [1.15.6]

- Bump silverfin-cli version to version that supports the partner API
- Bump dependencies after security audit

## [1.15.5]

- Fix for search and replace and dev-mode. So far, dev-mode was only working with the ActiveTextEditor. Changed to work on any saved file.
- Fix to yaml parser failing.

## [1.15.4]

- Catch yaml parser failing.

## [1.15.3]

- Update liquid testing JSON schema to support personal file properties

## [1.15.2]

- Update liquid testing JSON schema to support exclude_results in expectation block

## [1.15.1]

- Show an error when the template update fails.

## [1.15.0]

- New buttons in the side-bar to add or remove shared parts.

## [1.14.1]

- Side-bar. Development-mode. When one of the options in enabeled (local or platform), only show as enabled the button to stop that specific action.

## [1.14.0]

- New button in side-bar to create text parts. Also, automatically checks if part has been deleted to update it's reference in the corresponding config.json file

## [1.13.9]

- Update liquid testing JSON schema for validation

## [1.13.8]

- Support shared part quick fixes for account templates & export files

## [1.13.7]

- Fix issues with panels (parts and info) related to new template types (export files and account templates)

## [1.13.6]

- Fix: block clickable buttons in Development panel when there is no default firm set

## [1.13.5]

- Fix link to account templates in firm panel

## [1.13.4]

- Fix case where development panel was throwing an error for empty liquid testing YAMLs

## [1.13.3]

- Fix issue where 'Start' buttons for development mode was disabled even though the default firm was set

## [1.13.2]

- Testname visually dissapeared when moving across templates after the development mode for liquid tests was activated, now this will keep being displayed
- When no liquid tests exist or are not possible (i.e. shared parts), then we'll hide the liquid test development sections
- Development mode - platform was not working for shared parts
- Add default firm to text of "Development mode - platform" so users are reminded to which firm they're pushing
- Don't enable development mode if no default firm is set + add message to inform the user that they still need to set one

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

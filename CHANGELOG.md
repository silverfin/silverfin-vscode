# Change Log

All notable changes to the "silverfin-development-toolkit" extension will be documented in this file.

## [1.6.0]

- Implement Quick Fixes
  - Remove row when the value provided by the API is "nothing" (row doesn't exists)
  - Replace the expected value with the one got from the API response.

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

- Updated: Wrong link in README

## [1.1.0]

- Show only the statusBar icon when there is a YAML file opened in the activeTab

## [1.0.0]

- SF-Toolkit added as a dependency.
- Run your Liquid Tests from the Extension.
- Visualize Liquid Test's output in the YAML files.

## [0.0.3]

- Replaced path for the JSON Schema (from a local file to an external file). This change will make the schema read-only for users.

## [0.0.2]

- Updated local paths for schemas and snippets (`src` directory was omitted when publishing).

## [0.0.1]

- Added JSON Schema for liquid test written in YAML.
- Added YAML Code snippet of a sample test.
- Added Red Hat's YAML extension dependency.

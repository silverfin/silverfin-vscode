# Silverfin Development Toolkit

This extension aims to support the **Liquid testing** process of Silverfin templates. In the future, it should also add supports for the entire process of creating these templates with [Silverfin Templating Language](https://live.getsilverfin.com/f/200247/users/staff)

## Features

### Liquid testing

#### YAML Schema

Tests for liquid templates are written in YAML, and to support the process of writting those tests, this extension includes a **JSON Schema** which is going to be validated against your YAML files. This will help you out to detect possible errors while defining those test (e.g: missing required arguments or duplicated keys) with out having to wait to run those tests.
This SCHEMA is going to be applied to files which name ends with `_liquid_test.yaml`.

#### Integration with Silverfin API

You can run your Liquid Tests directly from VS Code with the click of a button and visualize the test results on top of the YAML file itself (You must have a registered API with Silverfin to have access to this features).

#### Code snippets

In addition, this extension will enable **code snippets** for YAML files.

## Requirements

- YAML extension: to apply our Schema to YAML files, we need to have [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) activated (this extension should be added automatically since it is set as a dependency).

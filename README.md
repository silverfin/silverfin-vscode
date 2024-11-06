# Silverfin Development Toolkit

![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)
![License](https://img.shields.io/github/license/silverfin/silverfin-vscode.svg)
![Issues](https://img.shields.io/github/issues/silverfin/silverfin-vscode.svg)

This extension aims to support the creation of **Liquid templates** with the [Silverfin Templating Language](https://developer.silverfin.com/docs) and the development of [Liquid testing YAML](https://developer.silverfin.com/docs/liquid-testing) files.

## Setup & Basic Usage

### Authorisation

Before installing the Silverfin Extension, you should first authenticate your device. Your device must be authenticated with the Silverfin API so the Silverfin extension can interact with the Silverfin Platform. For this you will need to contact Silverfin to receive a **Client ID** and **Client Secret**, and then add these credentials as environment variables on your local machine.

If you already have the Silverfin CLI installed, your device should already possess the relevant credentials, in which case no further action is required. Otherwise, please refer to the installation instructions for the [Silverfin CLI](https://github.com/silverfin/silverfin-cli). While installing the Silverfin CLI itself is optional, the instructions also include detailed step-by-step instructions on how to authenticate your device. Please follow these instuctions to complete authentication.

### Install Silverfin Extension

Once your device has been authenticated, the next stage is to download the extension itself. The [Silverfin Development Toolkit extension](https://marketplace.visualstudio.com/items?itemName=Silverfin.silverfin-development-toolkit) can be found in the VS Code Marketplace (you will need to have the version 1.0.0 or higher)

![image](resources/download-extension-1.png)

![image](resources/download-extension-2.png)

### Liquid testing

#### Prevalidation of YAML files

Tests for liquid templates are written in YAML, and to support the process of writting those tests, this extension includes a **JSON Schema** which is going to be validated against your YAML files.
This will help you out to detect possible errors while defining those tests (e.g: missing required arguments or duplicated keys) without having to wait to run those tests.
This SCHEMA is going to be applied to files which name ends with `_liquid_test.yml`.

#### Running a test

You can run your Liquid Tests directly from VS Code using the button at the bottom of the application.

![image](resources/test-button.png)

First, navigate to the relevant test `.yml` file, then press the "Silverfin: run liquid test" button.

---

_NOTE:_ You will need to set the firm ID before you can run any tests. Please refer to "Using the Command Palette" section below\_

---

On pressing the button, a dropdown will appear of all available tests, including the option to run _all_ tests.

Choose the test you wish to run. The test(s) will either pass, or any issues will be detailed in the problems panel at the bottom of VS Code. As well as highlighting problems, the extension will also suggest **potential fixes** to issues if the fault lies within the YAML code. You can view and apply these suggestions by hovering over the yellow lightbulb (![Yellow Lightbulb](resources/lightbulb.png)) that will appear when placing your cursor on the line with the error .

Running a specific test will visualize the test results alongside the YAML file itself, rendering how the template will appear with the inputted dummy data.

#### Using the Command Palette

You can access additional commands using the VS Code Command Palette.

As before, first navigate to the relevant test `.yml` file.

Then access the Command Palette either by using the shortcut Shift + Control + p (Shift + Command + p for Mac) or via the Application Menu by clicking View > Command Palette.

From there if you type in 'Silverfin' you will be given a choice of commands. The most relevant commands are likely to be:

| Command                                                                | Description                                                                                                     |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Silverfin: run specific liquid test (with HTML output from Input view) | Same as pressing the test button                                                                                |
| Silverfin: run all liquid tests                                        | Shortcut to run all liquid tests                                                                                |
| Silverfin: erase stored details of previous test runs (current)        | Clears problems panel                                                                                           |
| Silverfin: set active firm ID\*                                        | Set up which firm will be used as a test environment (your tests will be run as if you're working in this firm) |

---

_NOTE:_ You will need to set the Firm ID \*before\* you can run any tests.

---

## Features

### Silverfin Siderbar

After installing the extension you will have access to the new Silverfin Sidebar:

![image](resources/siderbar-1.png)

The sidebar will display the following information concerning the currently selected liquid template:

- **Parts:** A list of the associated parts and shared parts, including links to the listed (shared) parts enabling easy navigation.
- **Template Information:** Meta information such as it appears on the Platform e.g. handle, name, reconciliation type, etc.
- **Firms:** A list of firms which utilise the selected template and a list of firms for which you have authorised the API to work with.

This extension will also check if you are trying to include a shared part in your liquid that does not exist (in general / in your current set default firm) or if you are using a shared part that hasn't been added to the template yet. In the last case, it will give you a warning and will suggest to add it with the click of a button.

### Syntax Highlighting

This extension provides you with a default set of rules for Silverfin Liquid syntax highlighting and you can further customize the colors to your heart's desire.

### Auto Linting

Tests for liquid templates are written in YAML, and to support the process of writing those tests, this extension includes a **JSON Schema** which is going to be validated against your YAML files.
This will help you out to detect possible errors while defining those tests (e.g: missing required arguments or duplicated keys) without having to wait to run those tests.

This SCHEMA is going to be applied to files that end with `_liquid_test.yml`.

![image](resources/auto-linting-example.png)

You can run your Liquid Tests directly from VS Code with the click of a button and visualize the test results on top of the YAML file itself (You must have a registered API with Silverfin to have access to these features).
If you are running individual tests, you can also see the results of the test in the output panel (an HTML version of your template).

In addition, this extension will enable **code snippets** for `.liquid` & liquid testing `.yml` files. Please refer to **Snippets** section below for a full list of snippets.

## Snippets

This extension adds snippets to make your writing of liquid templates for Silverfin blazingly fast!

Any formatting choices that are made within the Snippets are made according to the [Liquid guidelines](https://developer.silverfin.com/docs/liquid-guidelines).

Snippets are available for the following categories:
 - Tags
 - Filters
 - Drops
 - Tables

### Drops
When selecting a drop snippet, you will have two options to choose from:
 - [some_drop]
 - [some_drop].

The first option will _close_ the drop

The second option, with the period, will continue the drop. On selecting this snippet, you will be given a list of available sub-drops for that drop. First navigate to the relevant sub-drop. If you wish to close off the drop, select the sub-drop you require using the mouse or by pressing enter. However, _if you wish to continue the drop_, instead start to type in the name of the required sub-drop, and then select the relevant snippet as before.

Some drops contain _identical_ sub-drops e.g. first exists for _both_ the accounts and the people drop. In such cases, you will be provided multiple snippets to choose from, so please pick the one with the relevant description.

#### Ctrl + Space
If you position your cursor at the end of a drop e.g. [period.accounts] and press Ctrl + Space, you will also be provided a list of the available snippets, which you can select to access the list of sub-drops

<br>

## Silverfin Snippets Reference

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silverfin Shortcut Reference</title>
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      border: 1px solid #ddd;
      padding: 8px;
      font-size: 17px;
    }
    h3 {
      color: #ddd;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <!-- STYLE SNIPPETS -->
  <h3>Style Snippets</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Shortcut</th>
        <th style="width: 70%;">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>&lt;p&gt;</code></td>
        <td>Add opening and closing <code>&lt;p&gt;</code> tags for paragraph text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>br</code></td>
        <td>Add an HTML line-break tag</td>
      </tr>
      <tr>
        <td><code>hr</code></td>
        <td>Add horizontal rule tag in HTML</td>
      </tr>
      <tr>
        <td><code>b</code></td>
        <td>Add opening and closing <code>&lt;b&gt;</code> tags for bold text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>i</code></td>
        <td>Add opening and closing <code>&lt;i&gt;</code> tags for italic text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>u</code></td>
        <td>Add opening and closing <code>&lt;u&gt;</code> tags for underlined text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>em</code></td>
        <td>Add opening and closing <code>&lt;em&gt;</code> tags for emphasized (italic) text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>strong</code></td>
        <td>Add opening and closing <code>&lt;strong&gt;</code> tags for strong (bold) text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>sub</code></td>
        <td>Add opening and closing <code>&lt;sub&gt;</code> tags for subscript text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>sup</code></td>
        <td>Add opening and closing <code>&lt;sup&gt;</code> tags for superscript text formatting in HTML</td>
      </tr>
      <tr>
        <td><code>h1, h2, h3, h4, h5, h6</code></td>
        <td>
          Add opening and closing tags for section heading text formatting in HTML. <code>&lt;h1&gt;</code> is the largest heading and <code>&lt;h6&gt;</code> is the smallest.<br>
          <strong>Cannot</strong> be used inside HTML tables within a Liquid template
        </td>
      </tr>
      <tr>
        <td><code>a, anchor</code></td>
        <td>Add opening and closing <code>&lt;a&gt;</code> tags for hyperlink text formatting in HTML</td>
      </tr>
    </tbody>
  </table>
  <!-- TAG SNIPPETS -->
  <h3>Tag Snippets</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Shortcut</th>
        <th style="width: 70%;">Description</th>
      </tr>
    </thead>
    <tbody>
      <!-- Comments -->
      <tr>
        <td colspan="2"><strong>Comments</strong></td>
      </tr>
      <tr>
        <td><code>comment</code></td>
        <td>Add opening and closing <code>comment</code> tags</td>
      </tr>
      <tr>
        <td><code>endcomment</code></td>
        <td>Only add the closing <code>comment</code> tag</td>
      </tr>
      <tr>
        <td><code>ic</code></td>
        <td>Add opening and closing <code>ic</code> tags (input only)</td>
      </tr>
      <tr>
        <td><code>endic</code></td>
        <td>Only add the closing <code>ic</code> tag (input only)</td>
      </tr>
      <tr>
        <td><code>nic</code></td>
        <td>Add opening and closing <code>nic</code> tags (export only)</td>
      </tr>
      <tr>
        <td><code>endnic</code></td>
        <td>Only add the closing <code>nic</code> tag (export only)</td>
      </tr>
      <!-- Variables -->
      <tr>
        <td colspan="2"><strong>Variables</strong></td>
      </tr>
      <tr>
        <td><code>assign</code></td>
        <td>Add an assign-tag</td>
      </tr>
      <tr>
        <td><code>assign_dynamic</code></td>
        <td>Add an assign tag for dynamic variable names</td>
      </tr>
      <tr>
        <td><code>capture</code></td>
        <td>Add opening and closing capture-tags</td>
      </tr>
      <tr>
        <td><code>endcapture</code></td>
        <td>Only add the closing capture-tag</td>
      </tr>
      <!-- Translations -->
      <tr>
          <td colspan="2"><strong>Translations</strong></td>
      </tr>
      <tr>
          <td><code>t=</code></td>
          <td>Set a translation with a default (different languages to be set depending on market)</td>
      </tr>
      <tr>
          <td><code>t</code></td>
          <td>Get a defined translation</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Input</strong></td>
      </tr>
      <tr>
          <td><code>input</code></td>
          <td>Add a standard text-input</td>
      </tr>
      <tr>
          <td><code>as:text</code></td>
          <td>Add the attribute for a textarea input</td>
      </tr>
      <tr>
          <td><code>as:currency</code></td>
          <td>Add the attribute for a currency input</td>
      </tr>
      <tr>
          <td><code>as:integer</code></td>
          <td>Add the attribute for an integer input</td>
      </tr>
      <tr>
          <td><code>as:percentage</code></td>
          <td>Add the attribute for a percentage input</td>
      </tr>
      <tr>
          <td><code>precision:</code></td>
          <td>Add the attribute to define the precision on a percentage input</td>
      </tr>
      <tr>
          <td><code>strip_insignificant_zeros</code></td>
          <td>Add the attribute to strip the final decimal zeros from a percentage value on an input</td>
      </tr>
      <tr>
          <td><code>as:boolean</code></td>
          <td>Add the attribute for a boolean input</td>
      </tr>
      <tr>
          <td><code>autoreload:</code></td>
          <td>Add the attribute to a boolean input to auto-reload</td>
      </tr>
      <tr>
          <td><code>as:date</code></td>
          <td>Add the attribute for a date input</td>
      </tr>
      <tr>
          <td><code>format:</code></td>
          <td>Add the attribute to define the date format display inside an input</td>
      </tr>
      <tr>
          <td><code>as:file</code></td>
          <td>Add the attribute for a file input</td>
      </tr>
      <tr>
          <td><code>document</code></td>
          <td>Add the attribute to show name of the (first) attached documents of a relevant custom value</td>
      </tr>
      <tr>
          <td><code>documents</code></td>
          <td>Add the attribute to show names of all attached documents of a relevant custom value</td>
      </tr>
      <tr>
          <td><code>[some documents].size</code></td>
          <td>Count number of files attached of a relevant custom value</td>
      </tr>
      <tr>
          <td><code>[some document].file_name</code></td>
          <td>Render name of relevant document</td>
      </tr>
      <tr>
          <td><code>[some document].link</code></td>
          <td>Render link to preview of relevant document</td>
      </tr>
      <tr>
          <td><code>as:select</code></td>
          <td>Add the attribute for a select input</td>
      </tr>
      <tr>
          <td><code>options:</code></td>
          <td>Add the options attribute to a select input</td>
      </tr>
      <tr>
          <td><code>option_values:</code></td>
          <td>Add the option_values attribute to a select input</td>
      </tr>
      <tr>
          <td><code>as:account_collection</code></td>
          <td>Add the attribute for an account collection input</td>
      </tr>
      <tr>
          <td><code>placeholder:</code></td>
          <td>Add the placeholder attribute to an input</td>
      </tr>
      <tr>
          <td><code>required:</code></td>
          <td>Add the required attribute to an input</td>
      </tr>
      <tr>
          <td><code>default:</code></td>
          <td>Add the default attribute or filter to an input or variable</td>
      </tr>
      <tr>
          <td><code>import_title:</code></td>
          <td>Add import_title attribute to _both_ fori loops and inputs within fori loop when importing reconciliation data to distinguish between different collections</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Radio Group</strong></td>
      </tr>
      <tr>
          <td><code>radiogroup</code></td>
          <td>Add a radio button input group</td>
      </tr>
      <tr>
          <td><code>radioinput</code></td>
          <td>Add individual buttons within a radio button group</td>
      </tr>
      <tr>
          <td><code>autoreload:</code></td>
          <td>Add the attribute to a radiogroup tag to auto-reload</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Control Flow</strong></td>
      </tr>
      <tr>
          <td><code>if</code></td>
          <td>Add opening and closing if-tags</td>
      </tr>
      <tr>
          <td><code>if else</code></td>
          <td>Add opening and closing if-tags with else-statement</td>
      </tr>
      <tr>
          <td><code>endif</code></td>
          <td>Only add closing if-tag</td>
      </tr>
      <tr>
          <td><code>else</code></td>
          <td>Only add else-tag</td>
      </tr>
      <tr>
          <td><code>elsif</code></td>
          <td>Only add elsif-tag</td>
      </tr>
      <tr>
          <td><code>ifi</code></td>
          <td>Add opening and closing ifi-tags</td>
      </tr>
      <tr>
          <td><code>endifi</code></td>
          <td>Only add closing ifi-tag</td>
      </tr>
      <tr>
          <td><code>unless</code></td>
          <td>Add opening and closing unless-tags</td>
      </tr>
      <tr>
          <td><code>endunless</code></td>
          <td>Only add closing unless-tag</td>
      </tr>
      <tr>
          <td><code>case</code></td>
          <td>Add opening and closing case-tags with a when and else-statement</td>
      </tr>
      <tr>
          <td><code>endcase</code></td>
          <td>Only add closing case-tag</td>
      </tr>
      <tr>
          <td><code>when</code></td>
          <td>Add a when-tag that is used within case-tags</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Iterations</strong></td>
      </tr>
      <tr>
          <td><code>for</code></td>
          <td>Add opening and closing forloop-tags</td>
      </tr>
      <tr>
          <td><code>endfor</code></td>
          <td>Only add closing forloop-tag</td>
      </tr>
      <tr>
          <td><code>fori</code></td>
          <td>Add opening and closing foriloop-tags</td>
      </tr>
      <tr>
          <td><code>endfori</code></td>
          <td>Only add closing foriloop-tag</td>
      </tr>
      <tr>
          <td><code>import_title</code></td>
          <td>Add import_title attribute to _both_ fori loops and inputs within fori loop when importing reconciliation data to distinguish between different collections</td>
      </tr>
      <tr>
          <td><code>forloop.index</code></td>
          <td>Add the forloop.index variable inside a forloop</td>
      </tr>
      <tr>
          <td><code>forloop.index0</code></td>
          <td>Add the forloop.index0 variable inside a forloop</td>
      </tr>
      <tr>
          <td><code>forloop.first</code></td>
          <td>Add the forloop.first variable inside a forloop</td>
      </tr>
      <tr>
          <td><code>forloop.last</code></td>
          <td>Add the forloop.last variable inside a forloop</td>
      </tr>
      <tr>
          <td><code>break</code></td>
          <td>Add the break-tag inside a forloop</td>
      </tr>
      <tr>
          <td><code>continue</code></td>
          <td>Add the continue-tag inside a forloop</td>
      </tr>
      <tr>
          <td><code>limit</code></td>
          <td>Add the limit attribute to a forloop</td>
      </tr>
      <tr>
          <td><code>offset</code></td>
          <td>Add the offset attribute to a forloop</td>
      </tr>
      <tr>
          <td><code>reversed</code></td>
          <td>Add the reversed attribute to a forloop</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Unreconciled</strong></td>
      </tr>
      <tr>
          <td><code>unreconciled</code></td>
          <td>Add the unreconciled tag as an indicator with unreconciled text</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Result</strong></td>
      </tr>
      <tr>
          <td><code>result</code></td>
          <td>Add a result tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Rollforward</strong></td>
      </tr>
      <tr>
          <td><code>rollforward</code></td>
          <td>Add a rollforward tag</td>
      </tr>
      <tr>
          <td><code>rollforward.period</code></td>
          <td>Add the rollforward.period variable</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Locale</strong></td>
      </tr>
      <tr>
          <td><code>locale</code></td>
          <td>Add opening and closing locale tags</td>
      </tr>
      <tr>
          <td><code>endlocale</code></td>
          <td>Only add closing locale-tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Include</strong></td>
      </tr>
      <tr>
          <td><code>include</code></td>
          <td>Add a tag to include a local or shared part</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Linkto</strong></td>
      </tr>
      <tr>
          <td><code>linkto</code></td>
          <td>Add opening and closing linkto-tags</td>
      </tr>
      <tr>
          <td><code>target:</code></td>
          <td>Add a target attribute to a linkto tag</td>
      </tr>
      <tr>
          <td><code>new_tab:</code></td>
          <td>Add a new_tab attribute to a linkto tag</td>
      </tr>
      <tr>
          <td><code>as:button</code></td>
          <td>Add the attribute for a button to a linkto-tag</td>
      </tr>
      <tr>
          <td><code>endlinkto</code></td>
          <td>Only add closing linkto-tag</td>
      </tr>
      <tr>
          <td><code>target</code></td>
          <td>Add a target tag with an id</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Adjustment Button</strong></td>
      </tr>
      <tr>
          <td><code>adjustmentbutton</code></td>
          <td>Add opening and closing adjustmentbutton-tags</td>
      </tr>
      <tr>
          <td><code>adjustmentbuttonwithpurpose</code></td>
          <td>Add an adjustmentbutton tag with a purpose attribute</td>
      </tr>
      <tr>
          <td><code>endadjustmentbutton</code></td>
          <td>Only add closing adjustmentbutton-tag</td>
      </tr>
      <tr>
          <td><code>adjustmenttransaction</code></td>
          <td>Add adjustmenttransaction-tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Group</strong></td>
      </tr>
      <tr>
          <td><code>group</code></td>
          <td>Add a closing and opening group-tag inside nic-tags</td>
      </tr>
      <tr>
          <td colspan="2"><strong>ADD NEW INPUTS</strong></td>
      </tr>
      <tr>
          <td><code>addnewinputs</code></td>
          <td>Add opening and closing addnewinputs-tags</td>
      </tr>
      <tr>
          <td><code>endaddnewinputs</code></td>
          <td>Only add closing addnewinputs-tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>SIGNMARKER</strong></td>
      </tr>
      <tr>
          <td><code>signmarker</code></td>
          <td>Add a signmarker tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>PUSH & POP</strong></td>
      </tr>
      <tr>
          <td><code>push</code></td>
          <td>Add a push tag</td>
      </tr>
      <tr>
          <td><code>pop</code></td>
          <td>Add a pop tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Change Orientation</strong></td>
      </tr>
      <tr>
          <td><code>changeorientation</code></td>
          <td>Add a changeorientation tag</td>
      </tr>
      <tr>
          <td colspan="2"><strong>Currency Configuration</strong></td>
      </tr>
      <tr>
          <td><code>currencyconfiguration</code></td>
          <td>Add opening and closing currencyconfiguration tags with the possible attributes</td>
      </tr>
      <tr>
          <td><code>endcurrencyconfiguration</code></td>
          <td>Only add closing currencyconfiguration tag</td>
      </tr>
      <tr>
          <td><code>zero_format</code></td>
          <td>Add attribute to set format of zeroes to "0" or "-"</td>
      </tr>
      <tr>
          <td><code>negative_format</code></td>
          <td>Add attribute to set format of negative numbers to "-xxx" or "(xxx)"</td>
      </tr>
      <tr>
          <td><code>precision</code></td>
          <td>Add attribute to set number of decimal places</td>
      </tr>
      <tr>
        <td><code>delimiter</code></td>
        <td>Add attribute to set style of delimiters to "x,xxx", "x.xxx", "xxxx", or "x xxx"</td>
      </tr>
      <tr>
        <td><code>separator</code></td>
        <td>Add attribute to set style of decimal separator to either "x,xx" or "x.xx"</td>
      </tr>
      <tr>
        <td colspan="2"><strong>New Page</strong></td>
      </tr>
      <tr>
        <td><code>newpage</code></td>
        <td>Add a newpage tag to signify the start of a new page in the PDF export</td>
      </tr>
      <tr>
        <td><code>section_break</code></td>
        <td>Add the attribute to create section breaks within input mode</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Styling</strong></td>
      </tr>
      <tr>
        <td><code>stripnewlines</code></td>
        <td>Add opening and closing stripnewlines-tags</td>
      </tr>
      <tr>
        <td><code>endstripnewlines</code></td>
        <td>Only add closing endstripnewlines-tag</td>
      </tr>
      <tr>
        <td><code>newline</code></td>
        <td>Add a newline tag</td>
      </tr>
      <tr>
        <td><code>indent</code></td>
        <td>Add an indent-tag with the possible options listed</td>
      </tr>
      <tr>
        <td><code>fontsize</code></td>
        <td>Add a font-tag with the possible options for the font-size listed</td>
      </tr>
      <tr>
        <td><code>fontcolor</code></td>
        <td>Add a font-tag with the attribute to a hex-color options</td>
      </tr>
      <tr>
        <td><code>infotextinline</code></td>
        <td>Add an inline-infotext inside ic-tags</td>
      </tr>
      <tr>
        <td><code>infotextblock</code></td>
        <td>Add full-width infotext inside ic-tags</td>
      </tr>
      <tr>
        <td><code>infotexthover</code></td>
        <td>Add an infotext with the as="hover" attribute</td>
      </tr>
      <tr>
        <td><code>warningtextinline</code></td>
        <td>Add an inline-warningtext inside ic-tags</td>
      </tr>
      <tr>
        <td><code>warningtextblock</code></td>
        <td>Add full-width warningtext inside ic-tags</td>
      </tr>
      <tr>
        <td><code>warningtexthover</code></td>
        <td>Add an warningtext with the as="hover"</td>
      </tr>
    </tbody>
  </table>
    <!-- FILTER SNIPPETS -->
    <h3>Filter Snippets</h3>
    <table>
    <thead>
        <tr>
            <th style="width: 30%;">Shortcut</th>
            <th style="width: 70%;">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2"><b>Date and Time</b></td>
        </tr>
        <tr>
            <td><code>date:"%d/%m/%Y"</code></td>
            <td>Add the filter for standard BE date formatting (DD/MM/YYYY)</td>
        </tr>
        <tr>
            <td><code>date:"%F"</code></td>
            <td>Add the filter for ISO date formatting (YYYY-MM-DD)</td>
        </tr>
        <tr>
            <td><code>localized_date</code></td>
            <td>Display a date according to the time-zone from where template is being executed</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Localized</strong></td>
        </tr>
        <tr>
            <td><code>localized</code></td>
            <td>Add the localized filter</td>
        </tr>
        <tr>
            <td><code>localize:</code></td>
            <td>Add the localize attribute</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Number</strong></td>
        </tr>
        <tr>
            <td><code>abs</code></td>
            <td>Add filter to return the absolute value of a number</td>
        </tr>
        <tr>
            <td><code>ABS (function)</code></td>
            <td>Add function to return absolute value from wrapped input</td>
        </tr>
        <tr>
            <td><code>ceil</code></td>
            <td>Add filter to return value rounded-up</td>
        </tr>
        <tr>
            <td><code>floor</code></td>
            <td>Add filter to return value rounded-down</td>
        </tr>
        <tr>
            <td><code>currency</code></td>
            <td>Add filter to return a value in the currency format</td>
        </tr>
        <tr>
            <td><code>invert</code></td>
            <td>Add filter to invert value of inputed accounts - <em>only</em> works with currency filter</td>
        </tr>
        <tr>
            <td><code>integer</code></td>
            <td>Add filter to convert value to the nearest whole number</td>
        </tr>
        <tr>
            <td><code>INT (function)</code></td>
            <td>Add function to convert wrapped input to nearest whole number</td>
        </tr>
        <tr>
            <td><code>percentage</code></td>
            <td>Add filter to return value as percentage</td>
        </tr>
        <tr>
            <td><code>number_to_human</code></td>
            <td>Add filter to convert inputted accounts into combination of integers + English words e.g. "287 Thousand"</td>
        </tr>
        <tr>
            <td><code>number_to_currency</code></td>
            <td>Add filter to convert a <em>string</em> value to the currency format</td>
        </tr>
        <tr>
            <td><code>round</code></td>
            <td>Add filter to return s rounded value (with default of two decimal places)</td>
        </tr>
        <tr>
            <td><code>modulo</code></td>
            <td>Add filter to divide value by a number and return the remainder</td>
        </tr>
        <tr>
            <td><code>max (function)</code></td>
            <td>Add the MAX function to return the largest value of an array of numbers</td>
        </tr>
        <tr>
            <td><code>min (function)</code></td>
            <td>Add the MIN function to return the smallest value in an array of numbers</td>
        </tr>
        <tr>
            <td><code>At_least</code></td>
            <td>Add filter to limit input to a minimum value</td>
        </tr>
        <tr>
            <td><code>At_most</code></td>
            <td>Add filter to limit input to a maximum value</td>
        </tr>
        <tr>
            <td><code>add_rounding_difference</code></td>
            <td>Add the add_rounding_difference filter</td>
        </tr>
        <tr>
            <td colspan="2"><strong>String</strong></td>
        </tr>
        <tr>
            <td><code>remove</code></td>
            <td>Add filter to removes substring from a given string</td>
        </tr>
        <tr>
            <td><code>replace</code></td>
            <td>Add filter to replace substring A with substring B within a given string</td>
        </tr>
        <tr>
            <td><code>upcase</code></td>
            <td>Add filter to transform all letters of a given string into uppercase</td>
        </tr>
        <tr>
            <td><code>downcase</code></td>
            <td>Add filter to transform all letters of a given string into lowercase</td>
        </tr>
        <tr>
            <td><code>capitalize</code></td>
            <td>Add filter to capitalise <em>each</em> word in a given string</td>
        </tr>
        <tr>
            <td><code>append</code></td>
            <td>Add filter to attach String B to the end of String A</td>
        </tr>
        <tr>
            <td><code>prepend</code></td>
            <td>Add filter to attach String B at the start of String B</td>
        </tr>
        <tr>
            <td><code>size</code></td>
            <td>Add filter to return the number of characters within a given String</td>
        </tr>
        <tr>
            <td><code>strip</code></td>
            <td>Add filter to string any whitespaces at the start and end of a given string</td>
        </tr>
        <tr>
            <td><code>default</code></td>
            <td>Add attribute to a string variable to return a default value <em>if</em> no value stored in the variable</td>
        </tr>
        <tr>
            <td><code>slice</code></td>
            <td>Add filter to return a substring of a given String, beginning from a certain index for a certain length</td>
        </tr>
        <tr>
            <td><code>newline_to_br / multiline_table</code></td>
            <td>Add filter to replace every newline character ("\n") with an HTML line break ("&lt;br&gt;")</td>
        </tr>
        <tr>
            <td><code>string_value</code></td>
            <td>Add filter to return a value from a variable or drop as a String rather than the inferred data type</td>
        </tr>
        <tr>
            <td><code>url_encode</code></td>
            <td>Add filter to replace any URL-unsafe character with three characters: a percent sign and the corresponding Hex value of the character replaced</td>
        </tr>
        <tr>
            <td><code>url_decode</code></td>
            <td>Add filter to decode a String encoded by the above url_encode filter</td>
        </tr>
        <tr>
            <td><code>strip_html</code></td>
            <td>Add filter to remove any HTML tags from a String</td>
        </tr>
        <tr>
            <td><code>md5</code></td>
            <td>Converts a string into an MD5 hash</td>
        </tr>
        <tr>
            <td><code>transliterate</code></td>
            <td>Transliterates strings based on the Unicoder library</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Array Operations</strong></td>
        </tr>
        <tr>
            <td><code>concat</code></td>
            <td>Add the Concat filter</td>
        </tr>
        <tr>
            <td><code>split</code></td>
            <td>Add the Split filter</td>
        </tr>
        <tr>
            <td><code>first</code></td>
            <td>Add the First filter</td>
        </tr>
        <tr>
            <td><code>last</code></td>
            <td>Add the Last filter</td>
        </tr>
        <tr>
            <td><code>join</code></td>
            <td>Add the Join filter</td>
        </tr>
        <tr>
            <td><code>sort</code></td>
            <td>Add the Sort filter</td>
        </tr>
        <tr>
            <td><code>uniq</code></td>
            <td>Add the Uniq filter</td>
        </tr>
        <tr>
            <td><code>reverse</code></td>
            <td>Add the Reverse filter</td>
        </tr>
        <tr>
            <td><code>map</code></td>
            <td>Add the map filter</td>
        </tr>
        <tr>
            <td><code>where</code></td>
            <td>Add the where filter</td>
        </tr>
        <tr>
            <td><code>group</code></td>
            <td>Add the group filter</td>
        </tr>
        <tr>
            <td><code>index by</code></td>
            <td>Add the index by filter</td>
        </tr>
        <tr>
            <td><code>range</code></td>
            <td>Add the range filter</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Other</strong></td>
        </tr>
        <tr>
            <td><code>allow_false</code></td>
            <td>Add the filter of allow_false</td>
        </tr>
        <tr>
            <td><code>analytical_code</code></td>
            <td>Add the analytical_code filter</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Date Manipulation</strong></td>
        </tr>
        <tr>
            <td><code>advance_years</code></td>
            <td>Add the advance_years filter</td>
        </tr>
        <tr>
            <td><code>advance_months</code></td>
            <td>Add the advance_months filter</td>
        </tr>
        <tr>
            <td><code>advance_weeks</code></td>
            <td>Add the advance_weeks filter</td>
        </tr>
        <tr>
            <td><code>advance_days</code></td>
            <td>Add the advance_days filter</td>
        </tr>
        <tr>
            <td><code>advance_hours</code></td>
            <td>Add the advance_hours filter</td>
        </tr>
        <tr>
            <td><code>advance_minutes</code></td>
            <td>Add the advance_minutes filter</td>
        </tr>
        <tr>
            <td><code>advance_seconds</code></td>
            <td>Add the advance_seconds filter</td>
        </tr>
        <tr>
            <td><code>retract_years</code></td>
            <td>Add the retract_years filter</td>
        </tr>
        <tr>
            <td><code>retract_months</code></td>
            <td>Add the retract_months filter</td>
        </tr>
        <tr>
            <td><code>retract_weeks</code></td>
            <td>Add the retract_weeks filter</td>
        </tr>
        <tr>
            <td><code>retract_days</code></td>
            <td>Add the retract_days filter</td>
        </tr>
        <tr>
            <td><code>retract_hours</code></td>
            <td>Add the retract_hours filter</td>
        </tr>
        <tr>
            <td><code>retract_minutes</code></td>
            <td>Add the retract_minutes filter</td>
        </tr>
        <tr>
            <td><code>retract_seconds</code></td>
            <td>Add the retract_seconds filter</td>
        </tr>
    </tbody>
    </table>
    <!--DROPS SNIPPETS -->
    <h2>Drops Snippets</h2>
    <table>
    <thead>
        <tr>
            <th style="width: 30%;">Shortcut</th>
            <th style="width: 70%;">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2"><strong>Common Drops</strong></td>
        </tr>
        <tr>
            <td><code>.size</code></td>
            <td>Return size of an array or string</td>
        </tr>
        <tr>
            <td><code>count</code></td>
            <td>Return count of all items in drop or collection (integer)</td>
        </tr>
        <tr>
            <td><code>email</code></td>
            <td>Return email address of person or user (String)</td>
        </tr>
        <tr>
            <td><code>first</code></td>
            <td>Return first item in drop or collection (integer)</td>
        </tr>
        <tr>
            <td><code>id</code></td>
            <td>Return unique identifier of account or mapping list (String)</td>
        </tr>
        <tr>
            <td><code>name</code></td>
            <td>Return name of item. If applied to an array, will return the name of the first item in the array (String)</td>
        </tr>
        <tr>
            <td><code>value</code></td>
            <td>Return (sum) value of the drop or collection (Number)</td>
        </tr>
        <tr>
            <td><code>custom.</code></td>
            <td>Return custom drops with placeholder namespace and key</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Accounts Drops</strong></td>
        </tr>
        <tr>
            <td><code>accounts</code></td>
            <td>All drops under the accounts drop</td>
        </tr>
        <tr>
            <td><code>starred</code></td>
            <td>Return all starred accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>starred.</code></td>
            <td>All drops under the starred drop</td>
        </tr>
        <tr>
            <td><code>assets</code></td>
            <td>Return all assets accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>assets.</code></td>
            <td>All drops under the assets drop</td>
        </tr>
        <tr>
            <td><code>liabilities</code></td>
            <td>Return all liabilities accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>liabilities.</code></td>
            <td>All drops under the liabilities drop</td>
        </tr>
        <tr>
            <td><code>revenues</code></td>
            <td>Return all revenue accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>revenues.</code></td>
            <td>All drops under the revenue drop</td>
        </tr>
        <tr>
            <td><code>expenses</code></td>
            <td>Return all expenses accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>expenses.</code></td>
            <td>All drops under the expenses drop</td>
        </tr>
        <tr>
            <td><code>income</code></td>
            <td>Return all income accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>income.</code></td>
            <td>All drops under the income drop</td>
        </tr>
        <tr>
            <td><code>equity</code></td>
            <td>Return all equity accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>equity.</code></td>
            <td>All drops for the equity drop</td>
        </tr>
        <tr>
            <td><code>credit_value</code></td>
            <td>Return sum of credit value of all selected accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>debit_value</code></td>
            <td>Return sum of debit value of all selected accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>first</code></td>
            <td>All drops under the account drop</td>
        </tr>
        <tr>
            <td><code>include_zeros</code></td>
            <td>Return accounts drop, including accounts with a zero balance, from all selected accounts - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>include_zeros.</code></td>
            <td>All drops for the equity drop</td>
        </tr>
        <tr>
            <td><code>p_and_l_rounding_difference</code></td>
            <td>Return exact PnL rounding difference when using the core rounding functionality - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>bs_rounding_difference</code></td>
            <td>Return exact BS rounding difference when using the core rounding functionality - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>p_and_l_rounding_account</code></td>
            <td>Return the account used for PnL rounding</td>
        </tr>
        <tr>
            <td><code>bs_rounding_account</code></td>
            <td>Return the account used for BS rounding</td>
        </tr>
        <tr>
            <td><code>return_values_in_millions</code></td>
            <td>Return value of the individual account drops in the selected accounts drop in millions - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td><code>return_values_in_thousands</code></td>
            <td>Return value of the individual account drops in the selected accounts drop in thousands - must use with variable of type accounts</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Company Drops</strong></td>
        </tr>
        <tr>
            <td><code>company</code></td>
            <td>Return all drops under the Company drop</td>
        </tr>
        <tr>
            <td><code>analytical_type_(0..x)_codes</code></td>
            <td>Returns drop of dimensions/companies in an analytical/consolidation file (drop)</td>
        </tr>
        <tr>
            <td><code>city</code></td>
            <td>Return city from company settings (String)</td>
        </tr>
        <tr>
            <td><code>company_form</code></td>
            <td>Return company form from company settings (String)</td>
        </tr>
        <tr>
            <td><code>company_type</code></td>
            <td>Return company type from company settings (String)</td>
        </tr>
        <tr>
            <td><code>country</code></td>
            <td>Return country from company settings (String)</td>
        </tr>
        <tr>
            <td><code>country_code</code></td>
            <td>Return country code, based on country (String)</td>
        </tr>
        <tr>
            <td><code>currency</code></td>
            <td>Return company currency, based on country (String)</td>
        </tr>
        <tr>
            <td><code>file_code</code></td>
            <td>Return file number from company settings (String)</td>
        </tr>
        <tr>
            <td><code>locales</code></td>
            <td>Return available languages from company settings (array)</td>
        </tr>
        <tr>
            <td><code>periods_per_year</code></td>
            <td>Returns 1,4,12 depending on the reporting frequency (integer)</td>
        </tr>
        <tr>
            <td><code>postalcode</code></td>
            <td>Return post code from company settings (String)</td>
        </tr>
        <tr>
            <td><code>street</code></td>
            <td>Return street from company settings (String)</td>
        </tr>
        <tr>
            <td><code>vat_identifier</code></td>
            <td>Return VAT identifier from company settings (String)</td>
        </tr>
        <tr>
            <td colspan="2"><strong>People Drops</strong></td>
        </tr>
        <tr>
            <td><code>people</code></td>
            <td>All drops under the People drop</td>
        </tr>
        <tr>
            <td><code>directors</code></td>
            <td>All drops under the special Directors drop</td>
        </tr>
        <tr>
            <td><code>shareholders</code></td>
            <td>All drops under the special Shareholders drop</td>
        </tr>
        <tr>
            <td><code>first</code></td>
            <td>All drops under the person drop</td>
        </tr>
        <tr>
            <td><code>active_as_director</code></td>
            <td>Return all active directors - must use with special directors drop</td>
        </tr>
        <tr>
            <td><code>active_as_director</code></td>
            <td>All drops under the active as directors filter</td>
        </tr>
        <tr>
            <td><code>active_as_director_on</code></td>
            <td>Return all active directors on a certain date - must use with special directors drop</td>
        </tr>
        <tr>
            <td><code>active_as_director_on.</code></td>
            <td>All drops under the active as directors on filter</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Period Drops</strong></td>
        </tr>
        <tr>
            <td><code>period</code></td>
            <td>Return all drops under the Period drop</td>
        </tr>
        <tr>
            <td><code>accounts</code></td>
            <td>Return all accounts in the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>account_mapping_list</code></td>
            <td>All drops under the Account Mapping List drop</td>
        </tr>
        <tr>
            <td><code>marketplace_template_id</code></td>
            <td>Return id of Mapping List on the marketplace - must use with variable of type period (integer)</td>
        </tr>
        <tr>
            <td><code>adjustments</code></td>
            <td>Return all adjustments in the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>bookyear_index</code></td>
            <td>Return index of the bookyear in the period (first year is 1) - must use with variable of type period (integer)</td>
        </tr>
        <tr>
            <td><code>calendar_years</code></td>
            <td>Return an array of all calendar years in the fiscal year - must use with variable of type period (array)</td>
        </tr>
        <tr>
            <td><code>directors</code></td>
            <td>Return all directors in the period - must use with variable of type period (special drop)</td>
        </tr>
        <tr>
            <td><code>end_date</code></td>
            <td>Return end date of the period - must use with variable of type period (date)</td>
        </tr>
        <tr>
            <td><code>exists</code></td>
            <td>Return true if the period exists - must use with variable of type period (boolean)</td>
        </tr>
        <tr>
            <td><code>fiscal_year</code></td>
            <td>Return fiscal year of the period - must use with variable of type period (string)</td>
        </tr>
        <tr>
            <td><code>is_first_year</code></td>
            <td>Return true if the period is the first book year of client file - must use with variable of type period (boolean)</td>
        </tr>
        <tr>
            <td><code>month_end_dates</code></td>
            <td>Return an array of all month end dates in the fiscal year - must use with variable of type period (array)</td>
        </tr>
        <tr>
            <td><code>people</code></td>
            <td>Return all people in the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>reconciliations</code></td>
            <td>Return all reconciliations in the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>reports</code></td>
            <td>Return collection of Reports for the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>reports</code></td>
            <td>Return specific report for the period - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>shareholders</code></td>
            <td>Return all shareholders in the period - must use with variable of type period (special drop)</td>
        </tr>
        <tr>
            <td><code>start_date</code></td>
            <td>Return start date of the period - must use with variable of type period (date)</td>
        </tr>
        <tr>
            <td><code>year_end</code></td>
            <td>Return period drop of period at end of fiscal year - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>year_end_date</code></td>
            <td>Return end date of the fiscal year - must use with variable of type period (date)</td>
        </tr>
        <tr>
            <td><code>year_start_date</code></td>
            <td>Return start date of the fiscal year - must use with variable of type period (date)</td>
        </tr>
        <tr>
            <td><code>minus__xp/y</code></td>
            <td>Return period before current period by a set number of periods or year - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td><code>plus__xp/y</code></td>
            <td>Return period after current period by a set number of periods or year - must use with variable of type period (drop)</td>
        </tr>
        <tr>
            <td colspan="2"><strong>Reconciliations Drops</strong></td>
        </tr>
        <tr>
            <td><code>reconciliations</code></td>
            <td>All drops under the Reconciliations drop</td>
        </tr>
        <tr>
            <td><code>starred</code></td>
            <td>Return all starred reconciliations - must use with variable of type reconciliations (drop)</td>
        </tr>
        <tr>
            <td><code>starred</code></td>
            <td>All drops under the Starred Reconciliation drop</td>
        </tr>
        <tr>
            <td colspan="2"><strong>User Drops</strong></td>
        </tr>
        <tr>
            <td><code>user</code></td>
            <td>Return all drops under the User drop</td>
        </tr>
    </tbody>
    </table>
    <h2>Table Snippets</h2>
    <table class="usr-width-100">
    <thead>
        <tr>
            <th class="usr-width-30">Shortcut</th>
            <th class="usr-width-70">Description</th>
        </tr>
    </thead>
    <tbody>
        <!-- HTML Elements -->
        <tr>
            <td colspan="2"><strong>HTML Elements</strong></td>
        </tr>
        <!-- Table Elements -->
        <tr>
            <td colspan="2"><em>Table Elements</em></td>
        </tr>
        <tr>
            <td><code>table</code></td>
            <td>Add snippet for a minimal HTML table with a header, body, and width classes defined</td>
        </tr>
        <tr>
            <td><code>thead</code></td>
            <td>Add opening and closing <code>&lt;thead&gt;</code> tags for an HTML table</td>
        </tr>
        <tr>
            <td><code>tbody</code></td>
            <td>Add opening and closing <code>&lt;tbody&gt;</code> tags for an HTML table</td>
        </tr>
        <tr>
            <td><code>tr</code></td>
            <td>Add opening and closing <code>&lt;tr&gt;</code> tags for an HTML table with nested <code>&lt;td&gt;</code> elements</td>
        </tr>
        <tr>
            <td><code>th</code></td>
            <td>Add opening and closing <code>&lt;th&gt;</code> tags for an HTML table</td>
        </tr>
        <tr>
            <td><code>td</code></td>
            <td>Add opening and closing <code>&lt;td&gt;</code> tags for an HTML table</td>
        </tr>
        <!-- Text Formatting Elements -->
        <tr>
            <td colspan="2"><em>Text Formatting Elements</em></td>
        </tr>
        <tr>
            <td><code>br</code></td>
            <td>Add an HTML line-break tag</td>
        </tr>
        <tr>
            <td><code>b</code></td>
            <td>Add opening and closing <code>&lt;b&gt;</code> tags for bold text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>i</code></td>
            <td>Add opening and closing <code>&lt;i&gt;</code> tags for italic text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>u</code></td>
            <td>Add opening and closing <code>&lt;u&gt;</code> tags for underlined text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>em</code></td>
            <td>Add opening and closing <code>&lt;em&gt;</code> tags for emphasized (italic) text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>sub</code></td>
            <td>Add opening and closing <code>&lt;sub&gt;</code> tags for subscript text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>sup</code></td>
            <td>Add opening and closing <code>&lt;sup&gt;</code> tags for superscript text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>h1</code></td>
            <td>Add opening and closing <code>&lt;h1&gt;</code> tags for heading text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>h2</code></td>
            <td>Add opening and closing <code>&lt;h2&gt;</code> tags for sub-heading text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>a</code></td>
            <td>Add opening and closing <code>&lt;a&gt;</code> tags for hyperlink text formatting in HTML</td>
        </tr>
        <tr>
            <td><code>hr</code></td>
            <td>Add horizontal rule tag in HTML</td>
        </tr>
        <tr>
            <td><code>&lt;p&gt;</code></td>
            <td>Add opening and closing <code>&lt;p&gt;</code> tags for paragraph text formatting in HTML</td>
        </tr>
        <!-- HTML Attributes -->
        <tr>
            <td colspan="2"><strong>HTML Attributes</strong></td>
        </tr>
        <tr>
            <td><code>class</code></td>
            <td>Add <code>class</code> attribute to HTML elements</td>
        </tr>
        <!-- CSS Classes -->
        <tr>
            <td colspan="2"><strong>CSS Classes</strong></td>
        </tr>
        <!-- Alignment Classes -->
        <tr>
            <td colspan="2"><em>Alignment Classes</em></td>
        </tr>
        <tr>
            <td><code>usr-width-</code></td>
            <td>Add <code>usr-width-*</code> class to set element width</td>
        </tr>
        <tr>
            <td><code>usr-align-left</code></td>
            <td>Add <code>usr-align-left</code> class to align text left</td>
        </tr>
        <tr>
            <td><code>usr-align-center</code></td>
            <td>Add <code>usr-align-center</code> class to align text center</td>
        </tr>
        <tr>
            <td><code>usr-align-right</code></td>
            <td>Add <code>usr-align-right</code> class to align text right</td>
        </tr>
        <tr>
            <td><code>usr-align-justify</code></td>
            <td>Add <code>usr-align-justify</code> class to justify text</td>
        </tr>
        <tr>
            <td><code>usr-valign-top</code></td>
            <td>Add <code>usr-valign-top</code> class to vertically align content to top</td>
        </tr>
        <tr>
            <td><code>usr-valign-center</code></td>
            <td>Add <code>usr-valign-center</code> class to vertically align content to center</td>
        </tr>
        <tr>
            <td><code>usr-valign-bottom</code></td>
            <td>Add <code>usr-valign-bottom</code> class to vertically align content to bottom</td>
        </tr>
        <!-- Border Classes -->
        <tr>
            <td colspan="2"><em>Border Classes</em></td>
        </tr>
        <tr>
            <td><code>usr-line-top</code></td>
            <td>Add <code>usr-line-top</code> class to add a top border</td>
        </tr>
        <tr>
            <td><code>usr-line-bottom</code></td>
            <td>Add <code>usr-line-bottom</code> class to add a bottom border</td>
        </tr>
        <tr>
            <td><code>usr-line-left</code></td>
            <td>Add <code>usr-line-left</code> class to add a left border</td>
        </tr>
        <tr>
            <td><code>usr-line-right</code></td>
            <td>Add <code>usr-line-right</code> class to add a right border</td>
        </tr>
        <tr>
            <td><code>usr-double-line-top</code></td>
            <td>Add <code>usr-double-line-top</code> class to add a double top border</td>
        </tr>
        <tr>
            <td><code>usr-double-line-bottom</code></td>
            <td>Add <code>usr-double-line-bottom</code> class to add a double bottom border</td>
        </tr>
        <tr>
            <td><code>usr-double-line-left</code></td>
            <td>Add <code>usr-double-line-left</code> class to add a double left border</td>
        </tr>
        <tr>
            <td><code>usr-double-line-right</code></td>
            <td>Add <code>usr-double-line-right</code> class to add a double right border</td>
        </tr>
        <!-- Color and Styling Classes -->
        <tr>
            <td colspan="2"><em>Color and Styling Classes</em></td>
        </tr>
        <tr>
            <td><code>usr-border-color-*</code></td>
            <td>Add class to set table cell border color in Hex</td>
        </tr>
        <tr>
            <td><code>usr-background-color-*</code></td>
            <td>Add class to set table cell background color in Hex</td>
        </tr>
        <tr>
            <td><code>usr-indent-*</code></td>
            <td>Add <code>usr-indent-*</code> class to indent content</td>
        </tr>
        <tr>
            <td><code>usr-repeated-header</code></td>
            <td>Add <code>usr-repeated-header</code> class to repeat table header on new pages in PDF export</td>
        </tr>
        <tr>
            <td><code>usr-no-left-padding</code></td>
            <td>Add <code>usr-no-left-padding</code> class to remove default left padding</td>
        </tr>
        <tr>
            <td><code>usr-grayed-out-background-input</code></td>
            <td>Add class to set table cell background to gray</td>
        </tr>
        <tr>
            <td><code>usr-grayed-out-line-bottom-input</code></td>
            <td>Add class to set faint table cell bottom lines</td>
        </tr>
        <tr>
            <td><code>usr-hide-samepage-header</code></td>
            <td>Add <code>usr-hide-samepage-header</code> class to hide header when content continues on same page</td>
        </tr>
    </tbody>
</table>
</body>
</html>
****
## Third party extensions

- YAML extension: To apply our Schema to YAML files, we need to have [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) activated (this extension should be added automatically since it is set as a dependency).
- Auto Close Tag: To enable VS Code to automatically close HTML tags in Liquid files, we need to have [Jun Han's Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) activated (this extension should be added automatically since it is set as a dependency).


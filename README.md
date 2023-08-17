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

<br>

| <span style="font-size:1.4em;">**TAG SNIPPETS**<br></span>SHORTCUT | <span style="font-size:1.4em;"><br></span>DESCRIPTION |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **COMMENTS**                                                                                                   
| comment                   | Add opening and closing comment-tags                                                   |
| endcomment                | Only add the closing comment-tag                                                       |
| ic                        | Add opening and closing ic-tags                                                        |
| endic                     | Only add the closing ic-tag                                                            |
| nic                       | Add opening and closing nic-tags                                                       |
| endnic                    | Only add the closing nic-tag                                                           |
| &emsp;
| **VARIABLES**
| assign                    | Add an assign-tag                                                                      |
| capture                   | Add opening and closing capture-tags                                                   |
| endcapture                | Only add the closing capture-tag                                                       |
| &emsp;
| **TRANSLATIONS**
| t=                        | Set a translation with a default (different languages to be set depending on market)   |
| t                         | Get a defined translation                                                              |
| &emsp;
| **INPUT**
| input                     | Add a standard text-input                                                              |
| as:text                   | Add the attribute for a textarea input                                                 |
| as:currency               | Add the attribute for a currency input                                                 |
| as:integer                | Add the attribute for an integer input                                                 |
| as:boolean                | Add the attribute for a boolean input                                                  |
| as:date                   | Add the attribute for a date input                                                     |
| as:file                   | Add the attribute for a file input                                                     |
| as:select                 | Add the attribute for a select input                                                   |
| as:account_collection     | Add the attribute for an account collection input                                      |
| precision                 | Add the attribute to define the precision on an input                                  |
| strip_insignificant_zeros | Add the attribute to strip the final decimal zeros from a percentage value on an input |
| format                    | Add the attribute to define the date format display inside an input                    |
| options:                  | Add the options attribute to a select input                                            |
| option_values:            | Add the option_values attribute to a select input                                      |
| placeholder:              | Add the placeholder attribute to an input                                              |
| required:                 | Add the required attribute to an input                                                 |
| default:                  | Add the default attribute or filter to an input or variable                            |
| &emsp;
| **CONTROL FLOW**
| if                        | Add opening and closing if-tags                                                        |
| ifelse                    | Add opening and closing if-tags with else-statement                                    |
| endif                     | Only add closing if-tag                                                                |
| else                      | Only add else-tag                                                                      |
| elsif                     | Only add elsif-tag                                                                     |
| ifi                       | Add opening and closing ifi-tags                                                       |
| endifi                    | Only add closing ifi-tag                                                               |
| unless                    | Add opening and closing unless-tags                                                    |
| endunless                 | Only add closing unless-tag                                                            |
| case                      | Add opening and closing case-tags with a when and else-statement                       |
| endcase                   | Only add closing case-tag                                                              |
| when                      | Add a when-tag that is used within case-tags                                           |
| &emsp;
| **ITERATIONS**
| for                       | Add opening and closing forloop-tags                                                   |
| endfor                    | Only add closing forloop-tag                                                           |
| fori                      | Add opening and closing foriloop-tags                                                  |
| endfori                   | Only add closing foriloop-tag                                                          |
| forloop.index             | Add the forloop.index variable inside a forloop                                        |
| forloop.index0            | Add the forloop.index0 variable inside a forloop                                       |
| forloop.first             | Add the forloop.first variable inside a forloop                                        |
| forloop.last              | Add the forloop.last variable inside a forloop                                         |
| break                     | Add the break-tag inside a forloop                                                     |
| continue                  | Add the continue-tag inside a forloop                                                  |
| limit                     | Add the limit attribute to a forloop                                                   |
| offset                    | Add the offset attribute to a forloop                                                  |
| reversed                  | Add the reversed attribute to a forloop                                                |
| &emsp;
| **UNRECONCILED**
| unreconciled              | Add the unreconciled tag as an indicator with unreconciled text                        |
| &emsp;
| **RESULT**
| result                    | Add a result tag                                                                       |
| &emsp;
| **ROLLFORWARD**
| rollforward               | Add a rollforward tag                                                                  |
| rollforward.period        | Add the rollforward.period variable                                                    |
| &emsp;
| **LOCALE**
| locale                    | Add opening and closing locale tags                                                    |
| endlocale                 | Only add closing locale-tag                                                            |
| &emsp;
| **INCLUDE**
| include                   | Add a tag to include a local or shared part                                            |
| &emsp;
| **LINKTO**
| linkto                    | Add opening and closing linkto-tags                                                    |
| endlinkto                 | Only add closing linkto-tag                                                            |
| target                    | Add a target tag with an id                                                            |
| target:                   | Add a target attribute to a linkto tag                                                 |
| new_tab:                  | Add a new_tab attribute to a linkto tag                                                |
| as:button                 | Add the attribute for a button to a linkto-tag                                         |
| &emsp;
| **ADJUSTMENT BUTTON**
| adjustmentbutton          | Add opening and closing adjustmentbutton-tags                                          |
| endadjustmentbutton       | Only add closing adjustmentbutton-tag                                                  |
| adjustmenttransaction     | Add adjustmenttransaction-tag                                                          |
| &emsp;
| **GROUP**
| group                     | Add a closing and opening group-tag inside nic-tags                                    |
| &emsp;
| **ADD NEW INPUTS**
| addnewinputs              | Add opening and closing addnewinputs-tags                                              |
| endaddnewinputs           | Only add closing addnewinputs-tag                                                      |
| &emsp;
| **SIGNMARKER**
| signmarker                | Add a signmarker tag                                                                   |
| &emsp;
| **PUSH & POP**
| push                      | Add a push tag                                                                         |
| pop                       | Add a pop tag                                                                          |
| &emsp;
| **CHANGE ORIENTATION**
| changeorientation         | Add a changeorientation tag                                                            |
| &emsp;
| **CURRENCY CONFIGURATION**|               
| currencyconfiguration     | Add opening and closing currencyconfiguration-tags with the possible attributes        |
| endcurrencyconfiguration  | Only add closing currencyconfiguration-tag                                             |
| &emsp;
| **NEW PAGE**
| newpage                   | Add a newpage tag to signify the start of a new page                                   |
| &emsp;
| **STYLING**
| stripnewlines             | Add opening and closing stripnewlines-tags                                             |
| endstripnewlines          | Only add closing endstripnewlines-tag                                                  |
| newline                   | Add a newline tag                                                                      |
| indent                    | Add an indent-tag with the possible options listed                                     |
| fontsize                  | Add a font-tag with the possible options for the font-size listed                      |
| fontcolor                 | Add a font-tag with the attribute to a hex-color options                               |
| infotextinline            | Add an inline-infotext inside ic-tags                                                  |
| infotextblock             | Add full-width infotext inside ic-tags                                                 |
| infotexthover             | Add an infotext with the as="hover" attribute                                          |
| warningtextinline         | Add an inline-warningtext inside ic-tags                                               |
| warningtextblock          | Add full-width warningtext inside ic-tags                                              |
| warningtexthover          | Add an warningtext with the as="hover" attribute                                       |

<br>

| <span style="font-size:1.4em;">**FILTER SNIPPETS**</span><br>SHORTCUT | <span style="font-size:1.4em;"><br></span>DESCRIPTION |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **DATE AND TIME**
| date:"%d/%m/%Y"           | Add the filter for standard BE date formatting (DD/MM/YYYY)                            |
| date:"%F"                 | Add the filter for ISO date formatting (YYYY-MM-DD)                                    |
| &emsp;
| **LOCALIZED**
| localized                 | Add the localized filter                                                               |
| localize:                 | Add the localize attribute                                                             |
| &emsp;
| **NUMBER**                
| int                       | Add the INT type conversion function                                                   |
| max                       | Add the MAX function to return the largest value in an array of values &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; |
| min                       | Add the MIN function to return the smallest value in an array of values                |

<br>

| <span style="font-size:1.4em;">**DROPS SNIPPETS**</span><br>SHORTCUT | <span style="font-size:1.4em;"><br></span>DESCRIPTION |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **ACCOUNTS**
| Some shortcut             | Some description                                         |
| &emsp;
| **COMPANY**
| Some shortcut             | Some description                                         |
| &emsp;
| **PEOPLE**
| Some shortcut             | Some description                                         |
| &emsp;
| **PERIOD**
| Some shortcut             | Some description                                         |
| &emsp;
| **RECONCILIATION**
| Some shortcut             | Some description                                         |
| &emsp;
| **USER**
| Some shortcut             | Some description                                         |

<br>

| <span style="font-size:1.4em;">**TABLE SNIPPETS**</span><br>SHORTCUT | <span style="font-size:1.4em;"><br></span>DESCRIPTION |
| ------------------------- | -------------------------------------------------------------------------------------- |
| table                     | Add snippet for a minimal HTML table with a header, body and width classes defined &emsp;&emsp;&emsp; |
| thead                     | Add opening and closing thead-tags for an HTML table                                   |
| tbody                     | Add opening and closing tbody-tags for an HTML table                                   |
| tr                        | Add opening and closing tr-tags for an HTML table with nested td-elements              |
| th                        | Add opening and closing th-tags for an HTML table                                      |
| td                        | Add opening and closing td-tags for an HTML table                                      |
| br                        | Add an HTML line-break tag                                                             |
| b                         | Add opening and closing b-tags for bold text formatting in HTML                        |
| i                         | Add opening and closing i-tags for italic text formatting in HTML                      |
| u                         | Add opening and closing u-tags for underlined text formatting in HTML                  |
| usr-width-                | Add usr-width-\* class                                                                 |
| usr-align-left            | Add usr-align-left class                                                               |
| usr-align-center          | Add usr-align-center class                                                             |
| usr-align-right           | Add usr-align-right class                                                              |
| usr-align-justify         | Add usr-align-justify class                                                            |
| usr-valign-top            | Add usr-valign-top class                                                               |
| usr-valign-center         | Add usr-valign-center class                                                            |
| usr-align-bottom          | Add usr-valign-bottom class                                                            |
| usr-line-top              | Add usr-line-top class                                                                 |
| usr-line-bottom           | Add usr-line-bottom class                                                              |
| usr-line-left             | Add usr-line-left class                                                                |
| usr-line-right            | Add usr-line-right class                                                               |
| usr-double-line-top       | Add usr-double-line-top class                                                          |
| usr-double-line-bottom    | Add usr-double-line-bottom class                                                       |
| usr-double-line-right     | Add usr-double-line-right class                                                        |
| usr-line-left             | Add usr-line-left class                                                                |
| usr-valign-center         | Add usr-valign-center class                                                            |
| usr-line-right            | Add usr-line-right class                                                               |
| usr-indent-               | Add usr-indent class with list of possible values                                      |
| usr-repeated-header       | Add usr-repeated-header class                                                          |
| usr-no-left-padding       | Add usr-no-left-padding class                                                          |



## Third party extensions

- YAML extension: To apply our Schema to YAML files, we need to have [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) activated (this extension should be added automatically since it is set as a dependency).
- Auto Close Tag: To enable VS Code to automatically close HTML tags in Liquid files, we need to have [Jun Han's Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) activated (this extension should be added automatically since it is set as a dependency).

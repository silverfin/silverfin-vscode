# Silverfin Development Toolkit

This extension aims to support the creation of **Liquid templates** with the [Silverfin Templating Language](https://developer.silverfin.com/docs) and the development of [Liquid testing YAML](https://developer.silverfin.com/docs/liquid-testing) files.

## Features

### Syntax Highlighting

This extension provides you with a default set of rules for Silverfin Liquid syntax highlighting and you can further customize the colors to your heart's desire.

### Snippets

This extension adds snippets to make your writing of liquid templates for Silverfin blazingly fast!

Any formatting choices that are made within the Snippets are made according to the [Liquid guidelines](https://developer.silverfin.com/docs/liquid-guidelines).

List of available snippets:

| Shortcut                  | Description                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------- |
| comment                   | Add opening and closing comment-tags                                                   |
| endcomment                | Only add the closing comment-tag                                                       |
| ic                        | Add opening and closing ic-tags                                                        |
| endic                     | Only add the closing ic-tag                                                            |
| nic                       | Add opening and closing nic-tags                                                       |
| endnic                    | Only add the closing nic-tag                                                           |
| assign                    | Add an assign-tag                                                                      |
| capture                   | Add opening and closing capture-tags                                                   |
| endcapture                | Only add the closing capture-tag                                                       |
| t=                        | Set a translation with a default (different languages to be set depending on market)   |
| t                         | Get a defined translation                                                              |
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
| unreconciled              | Add the unreconciled tag as an indicator with unreconciled text                        |
| result                    | Add a result tag                                                                       |
| rollforward               | Add a rollforward tag                                                                  |
| rollforward.period        | Add the rollforward.period variable                                                    |
| locale                    | Add opening and closing locale tags                                                    |
| endlocale                 | Only add closing locale-tag                                                            |
| include                   | Add a tag to include a local or shared part                                            |
| linkto                    | Add opening and closing linkto-tags                                                    |
| endlinkto                 | Only add closing linkto-tag                                                            |
| target                    | Add a target tag with an id                                                            |
| target:                   | Add a target attribute to a linkto tag                                                 |
| new_tab:                  | Add a new_tab attribute to a linkto tag                                                |
| as:button                 | Add the attribute for a button to a linkto-tag                                         |
| adjustmentbutton          | Add opening and closing adjustmentbutton-tags                                          |
| endadjustmentbutton       | Only add closing adjustmentbutton-tag                                                  |
| adjustmenttransaction     | Add adjustmenttransaction-tag                                                          |
| group                     | Add a closing and opening group-tag inside nic-tags                                    |
| addnewinputs              | Add opening and closing addnewinputs-tags                                              |
| endaddnewinputs           | Only add closing addnewinputs-tag                                                      |
| signmarker                | Add a signmarker tag                                                                   |
| push                      | Add a push tag                                                                         |
| pop                       | Add a pop tag                                                                          |
| changeorientation         | Add a changeorientation tag                                                            |
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
| table                     | Add snippet for a minimal HTML table with a header, body and width classes defined     |
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

### Liquid testing

Tests for liquid templates are written in YAML, and to support the process of writting those tests, this extension includes a **JSON Schema** which is going to be validated against your YAML files.
This will help you out to detect possible errors while defining those test (e.g: missing required arguments or duplicated keys) with out having to wait to run those tests.
This SCHEMA is going to be applied to files which name ends with `_liquid_test.yml`.

#### Integration with Silverfin API

You can run your Liquid Tests directly from VS Code with the click of a button and visualize the test results on top of the YAML file itself (You must have a registered API with Silverfin to have access to this features).

#### Code snippets

In addition, this extension will enable **code snippets** for YAML files.

## Requirements

- YAML extension: to apply our Schema to YAML files, we need to have [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) activated (this extension should be added automatically since it is set as a dependency).

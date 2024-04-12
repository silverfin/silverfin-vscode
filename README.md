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

<br>

| SHORTCUT                  | DESCRIPTION |
| ------------------------- | ---------------------------------------- |
| <span style="font-size:1.4em;">**TAG SNIPPETS**<br></span> |
| **COMMENTS**                                                                                                   
| comment                   | Add opening and closing comment-tags                                                   |
| endcomment                | Only add the closing comment-tag                                                       |
| ic                        | Add opening and closing ic-tags                                                        |
| endic                     | Only add the closing ic-tag                                                            |
| nic                       | Add opening and closing nic-tags                                                       |
| endnic                    | Only add the closing nic-tag                                                           |
| &emsp;
| **VARIABLES**
| assign                    | Add an assign-tag        |
| capture                   | Add opening and closing capture-tags |
| endcapture                | Only add the closing capture-tag |
| &emsp;
| **TRANSLATIONS**
| t=                        | Set a translation with a default (different languages to be set depending on market) |
| t                         | Get a defined translation |
| &emsp;
| **INPUT**
| input                     | Add a standard text-input |
| &emsp; as:text                  | Add the attribute for a textarea input |
| &emsp; as:currency              | Add the attribute for a currency input |
| &emsp; as:integer               | Add the attribute for an integer input |
| &emsp; as:percentage            | Add the attribute for a percentage input |
| &emsp; &emsp;precision:         | Add the attribute to define the precision on a percentage input |
| &emsp; as:boolean               | Add the attribute for a boolean input |
| &emsp;&emsp; autoreload:        | Add the attribute to a boolean input to auto-reload |
| &emsp; as:date                  | Add the attribute for a date input |
| &emsp;&emsp; format:            | Add the attribute to define the date format display inside an input |
| &emsp; as:file                  | Add the attribute for a file input |
| &emsp;&emsp;document <br><br>   | Add the attribute to show name of the (first) attached documents of a relevant custom value |
| &emsp;&emsp;documents <br><br>  | Add the attribute to show names of all attached documents of a relevant custom value |
| &emsp;&emsp;[some documents].size | Count number of files attached of a relevant custom value|
| &emsp;&emsp;[some document].file_name | Render name of relevant document |
| &emsp;&emsp;[some document].link | Render link to preview of relevant document |
| &emsp;as:select                 | Add the attribute for a select input |
| &emsp;&emsp;options:            | Add the options attribute to a select input |
| &emsp;&emsp;option_values:      | Add the option_values attribute to a select input |
| &emsp;as:account_collection     | Add the attribute for an account collection input |
| strip_insignificant_zeros | Add the attribute to strip the final decimal zeros from a percentage value on an input |
| &emsp;placeholder:        | Add the placeholder attribute to an input |
| &emsp;required:           | Add the required attribute to an input |
| &emsp;default:            | Add the default attribute or filter to an input or variable |
| &emsp;
| **RADIO GROUP**
| radiogroup               | Add a radio button input group |
| radioinput               | Add individual buttons within a radio button group |
| &emsp; autoreload:       | Add the attribute to a radiogroup tag to auto-reload |
| &emsp;
| **CONTROL FLOW**
| if                        | Add opening and closing if-tags |
| if else                   | Add opening and closing if-tags with else-statement                                    |
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
| for                       | Add opening and closing forloop-tags |
| endfor                    | Only add closing forloop-tag |
| fori                      | Add opening and closing foriloop-tags |
| endfori                   | Only add closing foriloop-tag |
| &emsp; import_title <br><br> | Add import_title attribute to _both_ fori loops and inputs within fori loop when importing reconciliation data to distinguish between different collections |
| forloop.index             | Add the forloop.index variable inside a forloop |
| forloop.index0            | Add the forloop.index0 variable inside a forloop |
| forloop.first             | Add the forloop.first variable inside a forloop |
| forloop.last              | Add the forloop.last variable inside a forloop |
| break                     | Add the break-tag inside a forloop |
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
| currencyconfiguration     | Add opening and closing currencyconfiguration tags with the possible attributes |
| endcurrencyconfiguration  | Only add closing currencyconfiguration tag |
| zero_format               | Add attribute to set format of zeroes to "0" or "-" |
| negative_format           | Add attribute to set format of negative numbers to "-xxx" or "(xxx)" |
| precision                 | Add attribute to set number of decimal places |
| delimiter                 | Add attribute to set style of delimiters to "x,xxx", "x.xxx", "xxxx", or "x xxx" |
| separator                 | Add attribute to set style of decimal separator to either "x,xx" or "x.xx"
| &emsp;
| **NEW PAGE**
| newpage                   | Add a newpage tag to signify the start of a new page in the PDF export                 |
| section_break             | Add the attribute to create section breaks within input mode                           |
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
| warningtexthover          | Add an warningtext with the as="hover"                                                 |
| <br><br> |
| <span style="font-size:1.4em;">**FILTER SNIPPETS**</span> | |
| **DATE AND TIME**
| date:"%d/%m/%Y"           | Add the filter for standard BE date formatting (DD/MM/YYYY)                            |
| date:"%F"                 | Add the filter for ISO date formatting (YYYY-MM-DD)                                    |
| &emsp;
| **LOCALIZED**
| localized                 | Add the localized filter                                                               |
| localize:                 | Add the localize attribute                                                             |
| &emsp;
| **NUMBER** 
| abs                       | Add filter to return the absolute value of a number |
| &emsp;ABS (function)      | Add function to return absolute value from wrapped input |
| ceil                      | Add filter to return value rounded-up |
| floor                     | Add filter to return value rounded-down |
| currency                  | Add filter to return a value in the currency format |
| &emsp;invert              | Add filter to invert value of inputed accounts - _only_ works with currency filter |
| integer                   | Add filter to convert value to the nearest whole number |        
| &emsp;INT (function)      | Add function to convert wrapped input to nearest whole number |
| percentage                | Add filter to return value as percentage |
| number_to_human<br><br>   | Add filter to convert inputted accounts into combination of integers + English words e.g. "287 Thousand" |
| number_to_currency        | Add filter to convert a _string_ value to the currency format |
| round                     | Add filter to return s rounded value (with default of two decimal places) |
| modulo                    | Add filter to divide value by a number and return the remainder |
| max (function)            | Add the MAX function to return the largest value of an array of numbers |
| min (function)            | Add the MIN function to return the smallest value in an array of numbers |
| At_least                  | Add filter to limit input to a minimum value |
| At_most                   | Add filter to limit input to a maximum value |
| <br><br> |
| <span style="font-size:1.4em;">**DROPS SNIPPETS**</span> |
| **ACCOUNTS**
| accounts.starred<br>accounts.assets<br>accounts.liabilities<br>accounts.revenues<br>accounts.expenses<br>accounts.income<br>accounts.equity| Add the method for returning a new accounts drop with only these accounts<br><br><br><br><br><br><br> |
| accounts.count            | Add the method which returns the number of account drops in the accounts drop                                                                      |
| accounts.credit_value     | Add the method to return the sum of all credit values for all accounts in this accounts drop for this period                                       |
| accounts.debit_value     | Add the method to return the sum of all debit values for all accounts in this accounts drop for this period                                         |
| accounts.first | Add the method to return the first account drop of the accounts drop                                                                                          |
| accounts.include_zeroes | Add the method to return an accounts drop that includes all accounts, including those with a zero balance                                            |
| accounts.name | Add the method to return the name of the first account in this drop                                                                                            |
| accounts.p_and_l_rounding_difference,<br>accounts.bs_rounding_difference | Add the methods to display the exact rounding difference when using the core rounding functionality |
| p_and_l_rounding_account,<br>bs_rounding_account | Add the methods to return the account drop where the rounding difference is stored                                          |
| return_values_in_millions | Add the method to display the value of the individual account drops in the created accounts drop in millions                                                 |
| return_values_in_thousands | Add the method to display the value of the individual account drops in the created accounts drop in thousands |
| value | Add the method to return the sum of all values for all accounts in this accounts drop for this period |
| &emsp;
| **COMPANY**
| company.analytical_type_(0..x)_codes | Add the method to return drop with information about dimensions/companies in an analytical/consolidation file |
| company.city | Add the method to return the city from the company settings |
| company.company_form | Add the method to return the company form from the company settings |
| company.country | Add the method to return the country from the company settings |
| company.country_code | Add the method to return rhe country code based upon the country from the company settings |
| company.currency | Add the method to return the currency code from the company settings |
| company.custom | Add the method to attach custom information to a company, independant of the period |
| company.file_code | Add the method to return the file number from the company settings |
| company.locales | Add the method to return the available languages for the company |
| company.name | Add the method to return the company name from the company settings |
| company.periods_per_year | Add the method to returns 1,4,12 depending on the reporting frequency (yearly, quarterly or monthly)
| company.postalcode | Add the method to return the post code from the company settings |
| company.street | Add the method to return the street from the company settings |
| company.vat_identifier | Add the method to return the vat identifier from the company settings |
| &emsp;
| **PEOPLE**
| people.count | Add the method to count the number of person drops on the people drop (can also use with directors and shareholders drops) |
| people.first | Add the method to return the first person drop in the people drop (can also use with directors and shareholders drops) |
| directors.active_as_director| Add the filter for directors which returns those directors active during the book year |
| directors.active_as_director_on| Add the filter for directors which returns those directors active in a specific date |
| &emsp;
| **PERIOD**
| period.accounts | Add the method to return a collection of all accounts with bookings on this period |
| period.account_mapping_list.name | Add the method to return the name of the mapping list used for this period |
| period.account_mapping_list.id | Add the method to return the id of the mapping list on firm level |
| period.account_mapping_list.marketplace_template_id | Add the method to return the id of the mapping list on marketplace |
| period.adjustments | Add the method to return all the adjustments for the period |
| period.bookyear_index | Add the method to return the  index number of the current book year as an integer. The first book year equals 1 |
| period.calendar_years | Add the method to add an array of all calendar years in the fiscal year. The information for each calendar year is:<br>start_date, end_date, amount_of_days for the number of days the bookyear has in the calendar year, and<br> amount_of_days_in_full_year for the total number of days in the calendar year |
| period.custom | Add method to attach custom information to a period. This is done automatically in reconciliations |
| period.directors | Add method to return people drop of *all* individuals who are directors |
| period.end_date | Add method to return the date this period ends |
| period.exists | Add method to return true when the period exists in the Silverfin database |
| period.fiscal_year | Add method to return the fiscal year of this period |
| period.is_first_year | Add method to return true if the period is in the first book year of this client file |
| period.month_end_dates | Add method to return an array of all the end dates of the calendar months in this fiscal year |
| period.name | Add method to return the name of the period |
| period.people | Add method to return the people drop of *all* people attached to the period (typically copied from general<br> company level) |
| period.reconciliations | Add method to return a collection of all reconciliations for this period. You can ask for a specific reconciliation<br> by adding the handle. I.e. period.reconciliations.the_handle. |
| period.reports | Add method to return a collection of all reports for this period. You can ask for a specific report by adding the<br> handle. I.e. period.reports.the_handle |
| period.shareholders | Add method to return the people drop of *all* individuals who are shareholders |
| period.start_date | Add method to return the date this period starts |
| period.year_end | Add method to return the period at the end of the fiscal year this period is in |
| period.year_end_date | Add method to return the date of the end of the fiscal year of this period |
| period.year_start_date | Add method to return the date of the start of the fiscal year of this period |
| period.minus_xp/y <br><br> | Add method to return the period drop of the current period minus the amount of periods or years defined |
| period.plus_xp/y <br><br>  | Add method to return the period drop of the current period plus the amount of periods or years defined |
| &emsp;
| **RECONCILIATIONS**
| reconciliations.count | Add method which returns the amount of active reconciliations |
| reconciliations.[reconciliation_handle]* | Add method which returns the specific reconcilaition with matching handle<br>**Don't actually use the word handle but use that handle of the specific reconciliation instead* |
| reconciliations.star | Add method which returns reconciliations that are marked with a star |
| &emsp;
| **USER**
| user.name | Add method to return name of the Silverfin user |
| user.email | Add method to return Email of the Silverfin user |
| <br><br> |
| <span style="font-size:1.4em;">**TABLE SNIPPETS**</span>                                                           |
| table | Add snippet for a minimal HTML table with a header, body and width classes defined                         |
| thead                     | Add opening and closing thead-tags for an HTML table                                   |
| tbody                     | Add opening and closing tbody-tags for an HTML table                                   |
| tr                        | Add opening and closing tr-tags for an HTML table with nested td-elements              |
| th                        | Add opening and closing th-tags for an HTML table                                      |
| td                        | Add opening and closing td-tags for an HTML table                                      |
| br                        | Add an HTML line-break tag                                                             |
| b                         | Add opening and closing b-tags for bold text formatting in HTML                        |
| i                         | Add opening and closing i-tags for italic text formatting in HTML                      |
| u                         | Add opening and closing u-tags for underlined text formatting in HTML                  |
| usr-width-                | Add usr-width-\* class |
| usr-align-left            | Add usr-align-left class |
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
| usr-line-left             | Add usr-line-left class |
| usr-valign-center               | Add usr-valign-center class |
| usr-line-right                  | Add usr-line-right class |
| usr-border-color-\*             | Add class to set table cell border colour in Hex |
| usr-background-color-\*             | Add class to set table cell background colour in Hex |
| usr-indent-\*                   | Add usr-indent class with list of possible values |
| usr-repeated-header             | Add usr-repeated-header class |
| usr-no-left-padding             | Add usr-no-left-padding class |
| usr-grayed-out-background-input | Add class to set table cell background to grey |
| usr-grayed-out-line-bottom-input| Add class to set faint table cell bottom lines |



## Third party extensions

- YAML extension: To apply our Schema to YAML files, we need to have [Red Hat's YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) activated (this extension should be added automatically since it is set as a dependency).
- Auto Close Tag: To enable VS Code to automatically close HTML tags in Liquid files, we need to have [Jun Han's Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag) activated (this extension should be added automatically since it is set as a dependency).

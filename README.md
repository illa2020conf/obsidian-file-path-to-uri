# File path to URI (an Obsidian.md plugin)

This plugin lets you convert a local path to a file url link that can be used to link to files or folders that are located outside of your Obsidian vault.

![demo](https://raw.githubusercontent.com/MichalBures/obsidian-file-path-to-uri/master/demo.gif)

## How to use this plugin

### Convert written path
1. Select the whole path you want to convert.
2. Use the default hotkey `Ctrl/Cmd + Alt + Shift + U` or press `Ctrl/Cmd + P` to open the command palette and search for `File path to URI: Convert selected path to URI or back`.
3. The selected path will toggle between file path and file url.

### Convert path from clipboard to external link with path as title
1. Copy any path such as `C:\Users\Obsidian\Documents` or `\\network\folder\` to your clipboard
2. Use the default hotkey `Ctrl/Cmd + Alt + Shift + L` or press `Ctrl/Cmd + P` to open the command palette and search for `File path to URI: Paste path as URI link with path as title`.
3. The converted path will be pasted into the editor (that is either `[C:\Users\Obsidian\Documents](file:///C:/Users/Obsidian/Documents)`
   or `[\\\\network\folder\](file:///%5C%5Cnetwork/folder/)` in this example)

### Convert path from clipboard to link with the filename (last folder name) as title
1. Copy any path such as `C:\Users\Obsidian\Documents\file.txt` or `\\network\folder\` to your clipboard
2. Use the default hotkey `Ctrl/Cmd + Shift + L` or press `Ctrl/Cmd + P` to open the command palette and search for `File path to URI: Paste file path as URI link with filename as title`.
3. The converted path will be pasted into the editor (that is either `[file.txt](file:///C:/Users/Obsidian/Documents/file.txt)`
   or `[folder](file:///%5C%5Cnetwork/folder/)` in this example)

## How to change the hotkey 
You can change the hotkey combination in Obsidian settings under Hotkeys. Look for `File path to URI`.

![hotkeys](https://raw.githubusercontent.com/MichalBures/obsidian-file-path-to-uri/master/hotkeys.png)

## Transforms

- `C:\Users\Obsidian\Documents` <-> `file:///C://Users//Obsidian//Documents`
- `\\network\folder\` <-> `file:///%5C%5Cnetwork/folder/`
- ` "C:\Users\Obsidian\Documents" ` -> `file:///C://Users//Obsidian//Documents`
  
Strips the surrounding whitespace from the selection but double quotation marks are allowed.

# Version History

## 0.1.0 (2024-02-08)
- Initial release

## Credits

The project are forked from [https://github.com/agathauy/wikilinks-to-mdlinks-obsidian](https://github.com/agathauy/wikilinks-to-mdlinks-obsidian)

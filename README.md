# Warm Theme for Zotero

English | [中文](README.zh-CN.md)

A warm color theme for Zotero 7 and later. White and gray surfaces become ivory and beige, and the blue accent becomes burnt orange. It covers the library, the item list, the item pane, settings and dialogs, and the PDF reader's toolbar and sidebar. Dark mode gets a matching warm charcoal version.

<p align="center"><img src="docs/palette.svg" width="640" alt="Color palette: ivory, beige and burnt orange in light mode, warm charcoal and soft orange in dark mode"></p>

This is an unofficial project and is not affiliated with the Zotero project.

## Install

1. Download the latest `.xpi` file from the [Releases page](https://github.com/YufeiXIA/zotero-warm-theme/releases).
2. In Zotero, open Tools > Plugins, click the gear icon and choose "Install Plugin From File...". Pick the `.xpi` file.

The theme is on as soon as the plugin is enabled.

## Turning it on and off

Use Tools > Warm Theme. The change is immediate and needs no restart. Turning it off gives you Zotero's own colors back, and so does disabling or removing the plugin.

The theme follows Zotero's color scheme setting (Settings > General > Appearance and Language, where Automatic follows your system). It changes colors only. Fonts, sizes and layout stay exactly as they are, and the pages of your PDFs are not touched.

## How it works

Since version 7, Zotero draws its interface with a set of CSS color variables (`--material-background`, `--material-sidepane`, `--color-accent` and so on). The plugin adds one stylesheet that gives those variables new values, but only while the window's root element has a `zwt-theme` attribute. Switching the theme flips that attribute on every open Zotero window. Windows opened later get the stylesheet when they load.

The PDF reader's interface runs in a separate document that can't load the plugin's files, so it receives the same rules as an inline `<style>` element.

All the colors live in [`addon/content/theme.css`](addon/content/theme.css). If you want a different accent, change `--zwt-accent` there and build your own copy.

## Known limitations

- Other plugins that paint their own colors (some sidebars and panels) keep their colors.
- Tested on Zotero 10.0.6 for Windows. Zotero 7 and later on macOS and Linux use the same variables, but that hasn't been checked yet.

## Building from source

```
python scripts/build.py
```

This writes `build/zotero-warm-theme-<version>.xpi` and `build/update.json`. Zotero checks `update.json` for updates, so attach both files to the GitHub release tagged `v<version>`.

## See also

[Claude Code for Zotero](https://github.com/YufeiXIA/zotero-claude-code), a chat panel for the paper you are reading, uses the same palette.

## License

[MIT](LICENSE)

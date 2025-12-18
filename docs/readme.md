# 🔨 mdgen: Serverless Markdown to HTML Generator

**mdgen** is a static documentation generator that operates entirely within your browser (it is **serverless**).

By utilizing the **Filesystem API**, mdgen can read a local folder containing your Markdown (`.md`) files and render them as static **HTML** pages ready for online publication.

The entire process happens client-side: **no installation or compilation is required, and the absence of a server** ensures that your Markdown files never leave your computer.

## How to Get Started

To begin compiling your documentation:

1. Go to [mdgen.hund.studio](https://mdgen.hund.studio).
2. Select the **folder** (not a single file) containing your Markdown documentation.
3. Download the generated static HTML.

## `.mdgen directory`

The root of the documentation project allows for the customization of the final output (build) through the use of a special folder.
The `.mdgen` folder must be created directly in the documentation project's root directory to be recognized. This folder is intended to contain files and configurations for advanced customization of the generated documentation.

### Current Functionality

The `.mdgen` folder currently supports only the specification of a CSS file for style customization:

- **`style.css`**: A CSS file named `style.css` placed inside `.mdgen/` will be automatically detected and added to the final build. This allows you to apply custom styles, overriding or extending the default documentation styles.

### Planned Future Functionality

Future implementations that will utilize the `.mdgen` folder include:

- **Custom Logo**: Uploading a custom logo to replace the default one.
- **Sidebar Customization**: Offering options to customize the structure and appearance of the navigation sidebar.
- **Special Page Categories**: Creating and managing categories of pages with specific behaviors or layouts.

## Testing the cli tool

After compiling the CLI tool with `npm run build:cli`, you can test it by installing it globally using `npm i -g .` from the project root.

## Project Status (Beta)

Currently in alpha, the project is rapidly evolving. The completion of these tasks will mark our first official beta release:

- [ ] Additional dark/light color scheme;
- [ ] Add sample `.mdgen` styles (ae. Fantasy DnD)
- [ ] CLI mode
- [x] Fuzzy search functionality;
  - [x] Orama index generation on compile
  - [x] Better search UI
- [x] Currently, the default file used for each directory is `index.md`; it would be better to use `readme.md` and, if not found, then fall back to `index.md`;
- [x] The ability to upload **custom CSS and styles** through the use of a `.mdgen` directory;
- [x] Automatic refresh on file change **(limited browser support)**;
- [x] Support for **additional Markdown features**:
  - [x] remark-gfm
    - [x] Tables
    - [x] Checkboxes

## Next Steps

The following steps represent our immediate priorities following the initial launch. Completing these tasks will pave the way for our first stable release:

- [ ] Add markdown yaml metadata support
- [ ] Allow .ts/.js plugins from .mdgen folder
- [ ] Mobile version;

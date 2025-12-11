# Markdown Syntax: Basic Rules

Markdown is a lightweight markup language with plain text formatting syntax. It is designed to be converted to HTML and many other formats using a tool by the same name.

## 1. Headings (Titles)

Headings are created by using the hash symbol (#). The number of hashes determines the heading level (from 1 to 6).

| Markdown      | Output (Concept)      |
| :------------ | :-------------------- |
| # Heading 1   | H1 (Main Title)       |
| ## Heading 2  | H2 (Section Title)    |
| ### Heading 3 | H3 (Subsection Title) |

## 2. Text Styling (Emphasis)

You can emphasize text using asterisks (\*) or underscores (\_).

| Styling           | Markdown Syntax                | Example Output         |
| :---------------- | :----------------------------- | ---------------------- |
| Bold              | **bold text** or **bold text** | bold text              |
| Italic            | _italic text_ or _italic text_ | italic text            |
| Bold & Italic     | **_bold and italic_**          | bold and italic        |
| ~~Strikethrough~~ | ~~strikethrough text~~         | ~~strikethrough text~~ |

## 3. Lists

Unordered Lists (Bullet Points)

Use asterisks (\*), plus signs (+), or hyphens (-).

- Item one
- Item two
  - Sub-item A
  - Sub-item B

Ordered Lists (Numbered)

Use numbers followed by a period.

1. First item
2. Second item
3. Third item

## 4. Links

Create an inline link using square brackets for the link text and parentheses for the URL.

[Link Text](https://www.example.com)

Output: Link Text

## 5. Images

The syntax for images is similar to links, but preceded by an exclamation mark (!).

![Alt Text](url-to-image.png "Optional Title")

## 6. Blockquotes

Use the greater-than symbol (>) to denote a blockquote.

> This is an important quote or note.
>
> > This is a nested quote.

Output:

This is an important quote or note.

## 7. Code

Inline Code

Enclose code snippets within single backticks (`).

`This is inline code.`

Code Blocks

Use three backticks (```) to create a fenced code block. You can optionally specify the language for syntax highlighting.

```
Hello World
```

## 8. Horizontal Rule (Separator)

Use three or more asterisks (\*\*\*), hyphens (---), or underscores (\_\_\_) on a line by themselves.

---

## 9. Tables

Tables are often created using pipes (|) and hyphens (-). The second line is mandatory for column alignment.

| Header 1     |      Header 2 |    Header 3    |
| :----------- | ------------: | :------------: |
| Left-aligned | Right-aligned | Center-aligned |
| Row 2        |        Data 2 |     Data 3     |

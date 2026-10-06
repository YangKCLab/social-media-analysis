// MathJax configuration from the Material for MkDocs documentation
// (https://squidfunk.github.io/mkdocs-material/reference/math/).
// On a prose page, the arithmatex extension wraps every formula in an element
// with the class "arithmatex" and writes it between \( \) or \[ \].
// On a notebook page, a markdown cell is an element with the class
// "jp-RenderedMarkdown", and its formulas stay between $ $ or $$ $$.
// MathJax renders only the elements with one of these two classes:
// ignoreHtmlClass turns MathJax off for the header and the body of the Material
// theme, and processHtmlClass turns it on again inside the two kinds of elements.
// In a markdown cell of a notebook, write a dollar sign that is not a formula as \$.
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: "md-header|md-container",
    processHtmlClass: "arithmatex|jp-RenderedMarkdown"
  }
};

// This site does not use instant navigation (navigation.instant in mkdocs.yml),
// so MathJax renders each page once when the page loads. If instant navigation
// is turned on, add the document$.subscribe block of the documentation above,
// which renders the formulas again after each navigation.

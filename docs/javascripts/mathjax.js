// MathJax configuration from the Material for MkDocs documentation
// (https://squidfunk.github.io/mkdocs-material/reference/math/).
// The arithmatex extension wraps every formula in an element with the class
// "arithmatex", and MathJax renders only those elements.
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

// This site does not use instant navigation (navigation.instant in mkdocs.yml),
// so MathJax renders each page once when the page loads. If instant navigation
// is turned on, add the document$.subscribe block of the documentation above,
// which renders the formulas again after each navigation.

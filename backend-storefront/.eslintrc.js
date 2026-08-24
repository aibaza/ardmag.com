module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Storefront-ul foloseste linkuri locale prefixate dinamic cu tara.
    "@next/next/no-html-link-for-pages": "off",
    // Continutul editorial si juridic contine ghilimele romanesti in JSX.
    "react/no-unescaped-entities": "off",
  },
};

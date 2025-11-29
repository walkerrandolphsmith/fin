# @fin/bill-parser-decorator

Lightweight decorator that composes multiple bill parser implementations and
returns the most confident extraction result. This package is intended to be
used inside the `@fin` monorepo as the aggregation point for multiple
`IExtractBillDetailsFromPrintableDocuments` implementations (for example a
PDF-text based parser and an LLM-backed parser).

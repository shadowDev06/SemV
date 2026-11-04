# VESIT Major Project LaTeX Template

## How to use

1. Upload the complete folder to Overleaf.
2. Open `project_details.tex`.
3. Enter the project title, student names, PRNs, guide, HOD, and academic year.
4. Add the official VESIT logo as:
   `figures/vesit_logo.png`
5. Add the university logo as:
   `figures/university_logo.png`
6. Add project diagrams/screenshots inside:
   `figures/project_figures/`
7. Write each chapter inside the corresponding file in `chapters/`.
8. Add references to `references.bib`.
9. Compile `main.tex`.

## Important

The template contains placeholder institutional wording. Before final submission,
verify the exact certificate, declaration, margins, header/footer, logo placement,
degree wording, and university requirements against the latest official VESIT format.

## Adding figures

Example:

```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=0.85\textwidth]{figures/project_figures/system_architecture.png}
    \caption{System Architecture}
    \label{fig:architecture}
\end{figure}
```

Refer to it in the text using:

```latex
Figure~\ref{fig:architecture}
```

## Adding tables

Use the `table` environment and give every table a caption and label.

## References

Add BibTeX entries to `references.bib` and cite them using:

```latex
\cite{referencekey}
```

The template currently uses IEEE-style bibliography formatting.

## Logos

No official logo is embedded in this template. This avoids accidentally distributing
an outdated or incorrect institutional logo. Simply replace the placeholder files
with the current official logo files.

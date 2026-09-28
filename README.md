# Legal AI Scanner 

Build an MVP app with only two screens.
This app is a simple AI document-forgery checker.
Keep the UI extremely clean, simple, and suitable for non-technical users.
Use a modern professional look with clear spacing and large inputs.


---

Screen 1 — Document Scan Form

Create a full-screen form with the following fields in this exact order:

1. Full Name – required text input


2. Email – required email input


3. Document Type – required dropdown (options: Contract, Document, Cheque)


4. Upload Document – required file/image upload field with a camera icon 📷 next to it



Add validation: no field can be left empty.

At the bottom add a large primary button:

[🔍 Scan]

When the user clicks Scan → navigate to Screen 2.

This button will later call an external API (AWS Textract + Comprehend),
so add a clear placeholder text:
“AI analysis will run here via external API.”


---

Screen 2 — ResultAnalysis

This page shows the analysis result of the uploaded document.
Add a simple, clean layout with these sections:

Document Summary

Extracted Text (preview)

Suspicious Areas / Forgery Indicators

Final AI Decision


All sections should have placeholder boxes so I can integrate JSON output from my API later.

Add a “Back to Scan Page” link or button.


---

Extra Requirements

Do not add login/signup (not needed for MVP).

Keep the navigation minimal (only two screens).

Design for mobile-first layout.

Use a professional blue/white UI theme.

Make the interface ready for an API integration.

App name: Legal AI Scanner

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://legal-ai-scanner.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6b7356c7-c13c-4069-99bf-d53d0148f19e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

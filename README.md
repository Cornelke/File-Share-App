# FileShare

A fast, secure, and easy-to-use web app for sharing files between devices over WiFi or hotspot, without the need for internet access.

---

## Features
- **Peer-to-peer file sharing**: Send and receive files directly between devices on the same network.
- **No internet required**: Works over local WiFi or hotspot.
- **Progressive Web App (PWA)**: Installable, offline support, and mobile-friendly.
- **QR code and code-based connection**: Easily connect devices using QR codes or short connection codes.
- **Modern UI**: Built with React, shadcn-ui, and Tailwind CSS for a clean and responsive experience.

## Author
- **Trancent Tech** ((https://trancent.vercel.app))
- Project maintained by: (https://twitter.com/trancenttech)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

### Building for Production

```sh
npm run build
```
The production-ready files will be in the `dist/` directory.

### Preview Production Build Locally
```sh
npm run preview
```

## Deployment (Vercel)
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Vercel will auto-detect the Vite project and build it.
4. Your app will be live at `https://fileshare.vercel.app` (or your custom domain).

### PWA & SEO
- The app is a PWA with offline support and installability.
- SEO optimized with meta tags, manifest, sitemap, and robots.txt.

## Project Structure
- `src/` - Main application source code
- `public/` - Static files (icons, manifest, service worker, etc.)
- `vercel.json` - Vercel configuration

---

**Happy sharing!**

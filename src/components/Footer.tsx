export default function Footer() {
    return (
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-10 text-sm text-mute">
          <span>© {new Date().getFullYear()} Curiosity. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a className="link" href="/privacy">Privacy Policy</a>
            <a className="link" href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    );
  }
  

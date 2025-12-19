export default function Footer() {
    return (
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-mute">
          © {new Date().getFullYear()} Curiosity. All rights reserved.
        </div>
      </footer>
    );
  }
  
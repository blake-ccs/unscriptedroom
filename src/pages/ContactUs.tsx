import { useEffect, useState } from "react";
import ContactUsModal from "../components/ContactUsModal";

export default function ContactUs() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ContactUsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {!isOpen && (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Contact Us</h1>
          <p className="mt-3 text-sm text-mute">
            The contact form is closed. Refresh the page to reopen it.
          </p>
        </div>
      )}
    </div>
  );
}

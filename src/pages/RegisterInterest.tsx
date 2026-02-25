import { useEffect, useState } from "react";
import RegisterInterestModal from "../components/RegisterInterestModal";

export default function RegisterInterest() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(true);

  useEffect(() => {
    setIsRegisterOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <RegisterInterestModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      {!isRegisterOpen && (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Reserve a Seat</h1>
          <p className="mt-3 text-sm text-mute">
            The reservation form is closed. Refresh the page to reopen it.
          </p>
        </div>
      )}
    </div>
  );
}

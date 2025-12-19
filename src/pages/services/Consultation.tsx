export default function Consultation() {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-bold">Consultation</h2>
        <p className="mt-2 text-mute">We’ll design a program around your team.</p>
        <div className="card mt-8 p-6">
          <form className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-xl2 border border-gray-300 px-3 py-2 text-sm" placeholder="Name" />
            <input className="rounded-xl2 border border-gray-300 px-3 py-2 text-sm" placeholder="Email" />
            <input className="rounded-xl2 border border-gray-300 px-3 py-2 text-sm sm:col-span-2" placeholder="Company / Team" />
            <textarea className="rounded-xl2 border border-gray-300 px-3 py-2 text-sm sm:col-span-2" rows={4} placeholder="What are your goals?" />
            <button type="button" className="btn btn-primary sm:w-fit">Request consultation</button>
          </form>
        </div>
      </section>
    );
  }
  
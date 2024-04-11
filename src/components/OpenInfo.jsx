export function OpenInfo() {
  return (
    <section className="flex flex-row justify-between gap-x-5">
      <p className="font-thin text-wrap text-xl rounded border border-slate-600 px-5 py-5 bg-white my-auto">
        Place the coordinates in the order the txr will follow
      </p>
      <p className="font-thin text-xl rounded border border-slate-600 px-5 py-5 bg-white my-auto">
        For each ground marker location an experiment will be performed.
      </p>
      <p className="font-thin text-xl rounded border border-slate-600 px-5 py-5 bg-white my-auto">
        During an experiment the drone will move to the drone marker locations.
      </p>
      <p className="font-thin text-xl rounded border border-slate-600 px-5 py-5 bg-white my-auto">
        On each drone marker location a measurement will be carried out.
      </p>
      <p className="font-thin text-xl rounded border border-slate-600 px-5 py-5 bg-white my-auto">
        <strong>Click</strong> on the drone marker to see its relavant
        information on the right panel.
      </p>
    </section>
  );
}

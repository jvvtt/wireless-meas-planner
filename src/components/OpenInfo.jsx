export function OpenInfo() {
  return (
    <section className="flex flex-row justify-between gap-x-5">
      <h2 className="font-thin text-xl rounded border border-zinc-100 px-5 py-5">
        Place the coordinates in the order the transceiver will follow
      </h2>
      <p className="font-thin text-xl rounded border border-zinc-100 px-5 py-5">
        For each ground marker location an experiment will be performed.
      </p>
      <p className="font-thin text-xl rounded border border-zinc-100 px-5 py-5">
        During an experiment the drone will move to the drone marker locations.
      </p>
      <p className="font-thin text-xl rounded border border-zinc-100 px-5 py-5">
        On each drone marker location a measurement will be carried out.
      </p>
      <p className="font-thin text-xl rounded border border-zinc-100 px-5 py-5">
        <strong>Click</strong> on the drone marker to see its relavant
        information on the right panel.
      </p>
    </section>
  );
}

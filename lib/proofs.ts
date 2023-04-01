import initNoirWasm, { acir_read_bytes, compile } from "@noir-lang/noir_wasm";
// @ts-ignore
import { initialiseResolver } from "@noir-lang/noir-source-resolver";
import initializeAztecBackend from "@noir-lang/aztec_backend";

export const compileCircuit = async () => {
  await initNoirWasm();

  return await fetch(
    new URL(
      "../../matching-fruits-nargo/check-sets/src/main.nr",
      import.meta.url
    )
  )
    .then((r) => r.text())
    .then((code) => {
      initialiseResolver((id: any) => {
        return code;
      });
    })
    .then(() => {
      try {
        const compiled_noir = compile({});
        return compiled_noir;
      } catch (e) {
        console.log("Error while compiling:", e);
      }
    });
};

export const getAcir = async () => {
  const { circuit } = await compileCircuit();
  await initializeAztecBackend();
  return acir_read_bytes(circuit);
};

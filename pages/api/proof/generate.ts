// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { acir_read_bytes, compile } from "@noir-lang/noir_wasm";
import initializeAztecBackend from "@noir-lang/aztec_backend";
import { initialiseResolver } from "@noir-lang/noir-source-resolver";
import fs from "fs";
import path from "path";
import {
  create_proof,
  setup_generic_prover_and_verifier,
  // @ts-ignore
} from "@noir-lang/barretenberg";

const compileCircuit = async () => {
  initialiseResolver(() => {
    try {
      const code = fs.readFileSync(
        path.resolve(
          __dirname,
          "../../../../../../matching-fruits-nargo/check-sets/src/main.nr"
        ),
        { encoding: "utf8" }
      );
      console.log(code);
      return code;
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  try {
    const compiled_noir = compile({});
    return compiled_noir;
  } catch (e) {
    console.log("Error while compiling:", e);
  }
};

export const getAcir = async () => {
  const { circuit } = await compileCircuit();
  await initializeAztecBackend();
  return acir_read_bytes(circuit);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { input } = req.body;
  try {
    //await initializeAztecBackend();
    const acir = await getAcir();

    console.log(input);

    const [prover, verifier] = await setup_generic_prover_and_verifier(acir);

    const proof = await create_proof(prover, acir, input);
    res.status(200).json({ proof, acir });
  } catch (er) {
    console.log(er);
    res.status(400).json({ error: er });
  }
}

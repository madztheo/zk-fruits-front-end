import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { useState } from "react";
import { Input } from "@/components/input/Input";
import { Button } from "@/components/button/Button";
import { getAcir } from "@/lib/proofs";
import { hashSet } from "@/lib";
import { Alert } from "@/components/alert/Alert";
import Ethers from "../lib/ethers";

export default function Home() {
  const [formA, setFormA] = useState(["", "", "", "", "", ""]);
  const [formB, setFormB] = useState(["", "", "", "", "", ""]);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [verifyingProof, setVerifyingProof] = useState(false);
  const [acir, setAcir] = useState();
  const [proof, setProof] = useState();
  const [alert, setAlert] = useState({
    message: "",
    error: false,
  });

  const onGenerateProofServerSide = async () => {
    setGeneratingProof(true);
    const response = await fetch("/api/proof/generate", {
      method: "POST",
      body: JSON.stringify({
        input: {
          setA: hashSet(
            new Set(formA.filter((x) => !!x)),
            process.env.NEXT_PUBLIC_SECRET_KEY as string
          ),
          setB: hashSet(
            new Set(formB.filter((x) => !!x)),
            process.env.NEXT_PUBLIC_SECRET_KEY as string
          ),
        },
      }),
    });
    if (response.ok) {
      const { proof, acir } = await response.json();
      setProof(proof);
      setAcir(acir);
      setAlert({
        message: "You have at least one fruit in common",
        error: false,
      });
    } else {
      setAlert({
        message: "No match",
        error: true,
      });
    }
    setGeneratingProof(false);
  };

  const onGenerateProof = async () => {
    setProof(undefined);
    // only launch if we do have an acir to calculate the proof from
    const acir = await getAcir();
    setAcir(acir);

    // set a pending state to show a spinner
    setGeneratingProof(true);

    if (acir) {
      // launching a new worker for the proof calculation
      const worker = new Worker(new URL("../lib/prover.ts", import.meta.url));

      // handling the response from the worker
      worker.onmessage = (e) => {
        if (e.data instanceof Error) {
          setAlert({
            message: "No match",
            error: true,
          });
          setGeneratingProof(false);
        } else {
          setAlert({
            message: "You have at least one fruit in common",
            error: false,
          });
          setProof(e.data);
          setGeneratingProof(false);
        }
      };

      // sending the acir and input to the worker
      worker.postMessage({
        acir,
        input: {
          setA: hashSet(
            new Set(formA.filter((x) => !!x)),
            process.env.NEXT_PUBLIC_SECRET_KEY as string
          ),
          setB: hashSet(
            new Set(formB.filter((x) => !!x)),
            process.env.NEXT_PUBLIC_SECRET_KEY as string
          ),
        },
      });
    }
  };

  const onVerifyProof = async () => {
    setVerifyingProof(true);
    // only launch if we do have an acir and a proof to verify
    if (acir && proof) {
      // launching a new worker for the verification
      const worker = new Worker(new URL("../lib/verifier.ts", import.meta.url));
      console.log("worker launched");

      // handling the response from the worker
      worker.onmessage = async (e) => {
        if (e.data instanceof Error) {
          setAlert({
            message: "This proof is not valid",
            error: true,
          });
          setVerifyingProof(false);
        } else {
          setAlert({
            message: "This proof is valid, your match is certified!",
            error: false,
          });
          setVerifyingProof(false);

          try {
            // Verifies proof on-chain
            const ethers = new Ethers();
            const ver = await ethers.contract.verify(proof);
            if (ver) {
              setAlert({
                message: "Proof double checked on-chain!",
                error: true,
              });
            }
          } catch (error) {}
        }
      };

      // sending the acir and proof to the worker
      worker.postMessage({ acir, proof });
    }
  };

  return (
    <>
      <Alert
        message={alert.message}
        isError={alert.error}
        visible={!!alert.message}
        onClose={() => {
          setAlert({
            message: "",
            error: false,
          });
        }}
      />
      <Head>
        <title>ZK Fruits</title>
        <meta name="description" content="Do you like bananas?" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.left}>
            <div className={styles.forms}>
              <div className={styles.form}>
                <p className={styles.form__title}>Alice</p>
                {formA.map((item, index) => (
                  <Input
                    key={index}
                    placeholder="Enter a fruit you like"
                    containerClassName={styles.input__container}
                    value={item}
                    onChange={(val: string) => {
                      setFormA((prev) => {
                        const copy = [...prev];
                        copy[index] = val;
                        return copy;
                      });
                    }}
                  />
                ))}
              </div>
              <div className={styles.form}>
                <p className={styles.form__title}>Bob</p>
                {formB.map((item, index) => (
                  <Input
                    key={index}
                    placeholder="Enter a fruit you like"
                    containerClassName={styles.input__container}
                    value={item}
                    onChange={(val: string) => {
                      setFormB((prev) => {
                        const copy = [...prev];
                        copy[index] = val;
                        return copy;
                      });
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.buttons}>
              <Button
                className={styles.button}
                text="Generate proof"
                onClick={onGenerateProof}
                loading={generatingProof}
                loadingText="Generating proof..."
              />
              <Button
                className={styles.button}
                text="Verify proof"
                onClick={onVerifyProof}
                disabled={!proof}
                loading={verifyingProof}
                loadingText="Verifying proof..."
              />
            </div>
          </div>
          {proof && (
            <div className={styles.right}>
              <p className={styles.title}>Proof</p>
              <p className={styles.proof}>{proof}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useEffect } from "react";
import styles from "../styles/Match.module.scss";
import { connectToSocket } from "../lib";

export default function Match() {
  useEffect(() => {
    /*connectToSocket(
      () => {},
      () => {},
      () => {}
    );*/
  }, []);

  return (
    <div className={styles.container}>
      <h1>Match</h1>
    </div>
  );
}

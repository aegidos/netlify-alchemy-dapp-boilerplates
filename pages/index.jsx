import styles from "../styles/Home.module.css";
import InstructionsComponent from "../components/InstructionsComponent";
import LoginButton from "../components/LoginButton";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <LoginButton />
        <InstructionsComponent />
      </main>
    </div>
  );
}

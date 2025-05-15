import "./App.css";
import { Machine } from "./components/Machine";

function App() {
  return (
    <main>
      <h1 style={{ textAlign: "center", width: "100%" }}>🎱 로또 추첨기</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flex: 1,
        }}
      >
        <Machine />
      </div>
    </main>
  );
}

export default App;

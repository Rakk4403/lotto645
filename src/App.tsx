import "./App.css";
import { Machine } from "./components/Machine";

function App() {
  const isMobile = window.innerWidth < 768;

  return (
    <main>
      <h1
        style={{
          textAlign: "center",
          width: "100%",
          marginBottom: isMobile ? "5px" : "20px", // 데스크탑에서 제목 아래 여백 추가
        }}
      >
        🎱 로또 추첨기
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flex: 1,
          paddingTop: isMobile ? "0" : "20px", // 데스크탑에서 상단 여백 추가
        }}
      >
        <Machine />
      </div>
    </main>
  );
}

export default App;

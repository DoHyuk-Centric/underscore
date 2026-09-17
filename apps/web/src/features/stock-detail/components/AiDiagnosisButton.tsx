import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AiDiagnosisButton() {
  const navigate = useNavigate();

  return (
    <div className="ai-diagnosis">
      <button
        type="button"
        className="ai-diagnosis__button"
        onClick={() => navigate("/ai")}
      >
        <Sparkles size={18} aria-hidden="true" />
        내 거래 정보로 AI 진단하기
      </button>
    </div>
  );
}

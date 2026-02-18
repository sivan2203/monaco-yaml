import type { EditorProblem } from "../types";

interface ProblemsPanelProps {
  problems: EditorProblem[];
  onProblemClick?: (problem: EditorProblem) => void;
}

const SEVERITY_ICONS: Record<EditorProblem["severity"], string> = {
  error: "\u2716",
  warning: "\u26A0",
  info: "\u24D8",
};

export function ProblemsPanel({ problems, onProblemClick }: ProblemsPanelProps) {
  if (problems.length === 0) return null;

  return (
    <div className="problems-panel">
      <div className="problems-header">
        <span className="problems-title">Проблемы</span>
        <span className="problems-count">{problems.length}</span>
      </div>
      <div className="problems-list">
        {problems.map((problem, i) => (
          <button
            key={`${problem.source}-${problem.startLineNumber}-${i}`}
            className="problem-item"
            onClick={() => onProblemClick?.(problem)}
          >
            <span className={`problem-icon problem-icon-${problem.severity}`}>
              {SEVERITY_ICONS[problem.severity]}
            </span>
            {problem.source === "backend" && (
              <span className="problem-source">backend</span>
            )}
            <span className="problem-message">{problem.message}</span>
            {problem.startLineNumber != null && (
              <span className="problem-location">
                [{problem.startLineNumber}:{problem.startColumn ?? 1}]
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
